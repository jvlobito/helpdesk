import PocketBase from "pocketbase";

import { createPocketBase, pocketbaseUrl } from "@/lib/pocketbase";

const maxAttachmentSize = 5 * 1024 * 1024;

type SessionLike = {
  token: string;
  user: {
    active: boolean;
    departmentId?: string;
    email: string;
    firstName: string;
    id: string;
    lastName: string;
    role: string;
  };
};

export function getCurrentTimestamp() {
  return new Date().toISOString();
}

export function buildAuthedPocketBase(session: SessionLike) {
  const client = createPocketBase();
  client.authStore.save(session.token, {
    active: session.user.active,
    collectionId: "_pb_users_auth_",
    collectionName: "users",
    department_id: session.user.departmentId ?? "",
    email: session.user.email,
    first_name: session.user.firstName,
    id: session.user.id,
    last_name: session.user.lastName,
    role: session.user.role,
  });

  return client;
}

export async function createAdminPocketBase() {
  const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
  const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error("Faltan credenciales admin de PocketBase.");
  }

  const client = new PocketBase(pocketbaseUrl);
  client.autoCancellation(false);
  await client.collection("_superusers").authWithPassword(adminEmail, adminPassword);
  return client;
}

export async function touchTicketActivity(client: ReturnType<typeof createPocketBase>, ticketId: string, timestamp = getCurrentTimestamp()) {
  try {
    await client.collection("tickets").update(ticketId, {
      updated_at: timestamp,
    });
  } catch {
    const adminClient = await createAdminPocketBase();
    await adminClient.collection("tickets").update(ticketId, {
      updated_at: timestamp,
    });
  }
}

export function getAttachmentFiles(formData: FormData, fieldName: string) {
  return formData
    .getAll(fieldName)
    .filter((value): value is File => value instanceof File && value.size > 0);
}

export function validateAttachments(files: File[], maxFiles = 3) {
  if (files.length > maxFiles) {
    return `Puedes adjuntar hasta ${maxFiles} archivos.`;
  }

  const oversized = files.find((file) => file.size > maxAttachmentSize);

  if (oversized) {
    return `El archivo ${oversized.name} supera el limite de 5 MB.`;
  }

  return null;
}

type NotificationInput = {
  href: string;
  message: string;
  ticketId?: string;
  title: string;
  userId: string;
};

export async function createNotification(input: NotificationInput) {
  const client = await createAdminPocketBase();
  const timestamp = getCurrentTimestamp();

  await client.collection("notifications").create({
    created_at: timestamp,
    created_ts: Date.now(),
    href: input.href,
    message: input.message,
    read: false,
    ticket_id: input.ticketId ?? null,
    title: input.title,
    updated_at: timestamp,
    user_id: input.userId,
  });
}
