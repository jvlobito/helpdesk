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
const closeAfterHours = Number(process.env.AUTO_CLOSE_AFTER_HOURS ?? "48");
const now = new Date();
const cutoff = new Date(now.getTime() - closeAfterHours * 60 * 60 * 1000).toISOString();

if (!adminEmail || !adminPassword) {
  throw new Error("Faltan credenciales admin para ejecutar autocierre.");
}

const pb = new PocketBase(pbUrl);
pb.autoCancellation(false);
await pb.collection("_superusers").authWithPassword(adminEmail, adminPassword);
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
  return !Number.isNaN(resolvedTime) && resolvedTime <= Date.parse(cutoff);
});

let closedCount = 0;

for (const record of candidates) {
  const timestamp = now.toISOString();

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
}

console.log(JSON.stringify({ candidates: candidates.length, closeAfterHours, closedCount, cutoff, now: now.toISOString() }, null, 2));
