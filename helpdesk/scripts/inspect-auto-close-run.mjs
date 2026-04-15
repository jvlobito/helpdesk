import fs from "node:fs";
import path from "node:path";

import PocketBase from "pocketbase";

const projectRoot = process.cwd();
const envFile = path.join(projectRoot, ".env.local");

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

loadEnv(envFile);

const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL ?? "http://127.0.0.1:8090";
const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;

if (!adminEmail || !adminPassword) {
  throw new Error("Faltan credenciales admin para inspeccionar job runs.");
}

const pb = new PocketBase(pbUrl);
pb.autoCancellation(false);
await pb.collection("_superusers").authWithPassword(adminEmail, adminPassword);

const latestRun = await pb.collection("job_runs").getFirstListItem('job_name = "tickets:auto-close"', {
  sort: "-started_at",
});

console.log(
  JSON.stringify(
    {
      candidateCount: latestRun.candidate_count,
      closeAfterHours: latestRun.close_after_hours,
      closedCount: latestRun.closed_count,
      cutoffAt: latestRun.cutoff_at,
      dryRun: latestRun.dry_run,
      errorCount: latestRun.error_count,
      errorSummary: latestRun.error_summary,
      finishedAt: latestRun.finished_at,
      id: latestRun.id,
      jobName: latestRun.job_name,
      processedCount: latestRun.processed_count,
      skippedCount: latestRun.skipped_count,
      startedAt: latestRun.started_at,
      status: latestRun.status,
      triggerSource: latestRun.trigger_source,
    },
    null,
    2,
  ),
);
