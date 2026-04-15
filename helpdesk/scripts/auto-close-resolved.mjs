import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import PocketBase from "pocketbase";

const projectRoot = process.cwd();
const envFile = path.join(projectRoot, ".env.local");
const jobName = "tickets:auto-close";

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (key && !(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function asDateString(value) {
  return value.toISOString().replace("T", " ");
}

function toErrorMessage(error) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function summarizeErrors(errors) {
  if (errors.length === 0) {
    return "";
  }

  return errors.slice(0, 5).join(" | ");
}

function shouldForceFailure(record) {
  const forcedTicketId = process.env.FORCE_FAIL_TICKET_ID;

  return typeof forcedTicketId === "string" && forcedTicketId.length > 0 && record.id === forcedTicketId;
}

async function createJobRun(pb, payload) {
  return pb.collection("job_runs").create(payload);
}

async function finishJobRun(pb, jobRunId, payload) {
  return pb.collection("job_runs").update(jobRunId, payload);
}

async function releaseJobLock(pb, lockId) {
  if (!lockId) {
    return;
  }

  try {
    await pb.collection("job_locks").delete(lockId);
  } catch {
    // Best effort cleanup.
  }
}

async function acquireJobLock(pb, lockedBy, lockMinutes) {
  const now = new Date();
  const lockExpiresAt = new Date(now.getTime() + lockMinutes * 60 * 1000);

  try {
    const existing = await pb.collection("job_locks").getFirstListItem(`job_name = "${jobName}"`);
    const expiresAt = Date.parse(existing.lock_expires_at || "");

    if (!Number.isNaN(expiresAt) && expiresAt > now.getTime()) {
      return {
        activeLock: existing,
        acquired: false,
      };
    }

    await pb.collection("job_locks").update(existing.id, {
      job_name: jobName,
      lock_expires_at: asDateString(lockExpiresAt),
      locked_at: asDateString(now),
      locked_by: lockedBy,
    });

    return {
      acquired: true,
      lock: await pb.collection("job_locks").getOne(existing.id),
    };
  } catch (error) {
    if (error?.status && error.status !== 404) {
      throw error;
    }
  }

  const created = await pb.collection("job_locks").create({
    job_name: jobName,
    lock_expires_at: asDateString(lockExpiresAt),
    locked_at: asDateString(now),
    locked_by: lockedBy,
  });

  return {
    acquired: true,
    lock: created,
  };
}

async function main() {
  loadEnv(envFile);

  const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL ?? "http://127.0.0.1:8090";
  const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
  const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;
  const closeAfterHours = Number(process.env.AUTO_CLOSE_AFTER_HOURS ?? "48");
  const jobSource = process.env.JOB_SOURCE ?? "manual";
  const dryRun = ["1", "true", "yes"].includes((process.env.DRY_RUN ?? "").toLowerCase());
  const lockMinutes = Number(process.env.JOB_LOCK_MINUTES ?? "15");
  const now = new Date();
  const cutoff = new Date(now.getTime() - closeAfterHours * 60 * 60 * 1000);
  const lockedBy = `${jobSource}:${os.hostname()}:${process.pid}`;

  if (!adminEmail || !adminPassword) {
    throw new Error("Faltan credenciales admin para ejecutar autocierre.");
  }

  if (!Number.isFinite(closeAfterHours) || closeAfterHours < 0) {
    throw new Error("AUTO_CLOSE_AFTER_HOURS debe ser un numero valido.");
  }

  const pb = new PocketBase(pbUrl);
  pb.autoCancellation(false);
  await pb.collection("_superusers").authWithPassword(adminEmail, adminPassword);

  let exitCode = 0;
  let lockId = null;
  let jobRunId = null;

  try {
    const lockResult = await acquireJobLock(pb, lockedBy, lockMinutes);

    if (!lockResult.acquired) {
      const skippedRun = await createJobRun(pb, {
        candidate_count: 0,
        close_after_hours: closeAfterHours,
        closed_count: 0,
        cutoff_at: asDateString(cutoff),
        dry_run: dryRun,
        error_count: 0,
        error_summary: `Lock activo por ${lockResult.activeLock.locked_by}`,
        finished_at: asDateString(now),
        job_name: jobName,
        processed_count: 0,
        skipped_count: 0,
        started_at: asDateString(now),
        status: "skipped",
        trigger_source: jobSource,
      });

      console.log(
        JSON.stringify(
          {
            closeAfterHours,
            cutoff: cutoff.toISOString(),
            dryRun,
            jobName,
            jobRunId: skippedRun.id,
            lockedBy,
            now: now.toISOString(),
            status: "skipped",
          },
          null,
          2,
        ),
      );

      return 0;
    }

    lockId = lockResult.lock.id;

    const runningRun = await createJobRun(pb, {
      candidate_count: 0,
      close_after_hours: closeAfterHours,
      closed_count: 0,
      cutoff_at: asDateString(cutoff),
      dry_run: dryRun,
      error_count: 0,
      error_summary: "",
      job_name: jobName,
      processed_count: 0,
      skipped_count: 0,
      started_at: asDateString(now),
      status: "running",
      trigger_source: jobSource,
    });
    jobRunId = runningRun.id;

    const supervisorUser = await pb.collection("users").getFirstListItem('role = "supervisor"');
    const records = await pb.collection("tickets").getFullList({
      filter: 'status = "resolved"',
    });

    const candidates = records.filter((record) => {
      const resolvedAt = typeof record.resolved_at === "string" ? record.resolved_at : "";

      if (!resolvedAt) {
        return false;
      }

      const resolvedTime = Date.parse(resolvedAt);
      return !Number.isNaN(resolvedTime) && resolvedTime <= cutoff.getTime();
    });

    const errors = [];
    let closedCount = 0;
    let processedCount = 0;

    for (const record of candidates) {
      processedCount += 1;

      if (dryRun) {
        continue;
      }

      try {
        if (shouldForceFailure(record)) {
          throw new Error(`Forced failure for ticket ${record.ticket_number || record.id}`);
        }

        const timestamp = asDateString(new Date());

        await pb.collection("tickets").update(record.id, {
          close_reason: "sin_respuesta_cliente",
          close_reason_detail: null,
          closed_at: timestamp,
          status: "closed",
          updated_at: timestamp,
        });

        await pb.collection("ticket_history").create({
          changed_at: timestamp,
          changed_by: supervisorUser.id,
          field_changed: "status",
          new_value: "closed",
          old_value: record.status,
          ticket_id: record.id,
        });

        await pb.collection("ticket_history").create({
          changed_at: timestamp,
          changed_by: supervisorUser.id,
          field_changed: "status",
          new_value: "Motivo de cierre: sin_respuesta_cliente",
          old_value: record.close_reason || "Sin motivo previo",
          ticket_id: record.id,
        });

        if (record.created_by) {
          await pb.collection("notifications").create({
            created_at: timestamp,
            created_ts: Date.now(),
            href: `/app/tickets/${record.id}`,
            message: "Tu ticket resuelto se cerro automaticamente por falta de respuesta dentro del plazo.",
            read: false,
            ticket_id: record.id,
            title: "Ticket autocerrado",
            updated_at: timestamp,
            user_id: record.created_by,
          });
        }

        if (record.assigned_to) {
          await pb.collection("notifications").create({
            created_at: timestamp,
            created_ts: Date.now(),
            href: `/app/agent/tickets/${record.id}`,
            message: "Un ticket resuelto se cerro automaticamente por falta de respuesta del cliente.",
            read: false,
            ticket_id: record.id,
            title: "Ticket autocerrado",
            updated_at: timestamp,
            user_id: record.assigned_to,
          });
        }

        closedCount += 1;
      } catch (error) {
        errors.push(`${record.ticket_number || record.id}: ${toErrorMessage(error)}`);
      }
    }

    const finishedAt = new Date();
    const status = errors.length === 0 ? "success" : closedCount > 0 || dryRun ? "partial_failure" : "failed";

    await finishJobRun(pb, jobRunId, {
      candidate_count: candidates.length,
      closed_count: dryRun ? 0 : closedCount,
      error_count: errors.length,
      error_summary: summarizeErrors(errors),
      finished_at: asDateString(finishedAt),
      processed_count: processedCount,
      skipped_count: dryRun ? candidates.length : candidates.length - closedCount - errors.length,
      status,
    });

    console.log(
      JSON.stringify(
        {
          candidateCount: candidates.length,
          closeAfterHours,
          closedCount: dryRun ? 0 : closedCount,
          cutoff: cutoff.toISOString(),
          dryRun,
          errorCount: errors.length,
          jobName,
          jobRunId,
          lockedBy,
          now: finishedAt.toISOString(),
          processedCount,
          skippedCount: dryRun ? candidates.length : candidates.length - closedCount - errors.length,
          status,
        },
        null,
        2,
      ),
    );

    if (status === "failed") {
      exitCode = 1;
    }
  } catch (error) {
    const finishedAt = new Date();

    if (jobRunId) {
      await finishJobRun(pb, jobRunId, {
        error_count: 1,
        error_summary: summarizeErrors([toErrorMessage(error)]),
        finished_at: asDateString(finishedAt),
        status: "failed",
      });
    }

    throw error;
  } finally {
    await releaseJobLock(pb, lockId);
  }

  return exitCode;
}

const exitCode = await main();

if (exitCode !== 0) {
  process.exitCode = exitCode;
}
