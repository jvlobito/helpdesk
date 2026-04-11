"use server";

import { refresh, revalidatePath } from "next/cache";

import { requireAuthSession } from "@/lib/auth-server";
import { buildAuthedPocketBase } from "@/lib/helpdesk-actions";

export async function markNotificationReadAction(formData: FormData) {
  const session = await requireAuthSession();
  const notificationId = String(formData.get("notificationId") ?? "").trim();

  if (!notificationId) {
    return;
  }

  const client = buildAuthedPocketBase(session);
  await client.collection("notifications").update(notificationId, {
    read: true,
  });

  revalidatePath("/app");
  revalidatePath("/app/tickets");
  revalidatePath("/app/agent/tickets");
  revalidatePath("/app/supervisor/dashboard");
  refresh();
}
