"use server";

import { refresh, revalidatePath } from "next/cache";
import { z } from "zod";

import { getTicketRouteForRole } from "@/lib/auth";
import { requireAuthSession } from "@/lib/auth-server";
import { buildAuthedPocketBase, createAdminPocketBase, createNotification, getCurrentTimestamp, touchTicketActivity } from "@/lib/helpdesk-actions";
import { allowedTransitions, closeReasons, reopenReasons, ticketStatuses, type CloseReason, type ReopenReason, type TicketStatus } from "@/lib/helpdesk";

const takeTicketSchema = z.object({
  returnPath: z.string().trim().min(1),
  ticketId: z.string().trim().min(1),
});

const changeStatusSchema = z.object({
  nextStatus: z.enum(ticketStatuses),
  returnPath: z.string().trim().min(1),
  ticketId: z.string().trim().min(1),
});

const customerResolutionSchema = z.object({
  closeReason: z.string().trim().optional(),
  closeReasonDetail: z.string().trim().optional(),
  decision: z.enum(["close", "reopen"]),
  reopenReason: z.string().trim().optional(),
  reopenReasonDetail: z.string().trim().optional(),
  returnPath: z.string().trim().min(1),
  ticketId: z.string().trim().min(1),
});

const reassignTicketSchema = z.object({
  assigneeId: z.string().trim().min(1, "Selecciona un agente."),
  returnPath: z.string().trim().min(1),
  ticketId: z.string().trim().min(1),
});

export type WorkflowFormState = {
  formError?: string;
  successMessage?: string;
  values?: {
    assigneeId?: string;
    closeReason?: string;
    closeReasonDetail?: string;
    nextStatus?: string;
    reopenReason?: string;
    reopenReasonDetail?: string;
    resolutionNote?: string;
  };
};

type AuthRecord = {
  assigned_to?: string;
  close_reason?: string;
  close_reason_detail?: string;
  created_by?: string;
  department_id?: string;
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  priority?: string;
  resolved_at?: string;
  reopen_reason?: string;
  reopen_reason_detail?: string;
  resolution_note?: string;
  role?: string;
  status?: string;
};

function isTicketStatus(value: unknown): value is TicketStatus {
  return typeof value === "string" && ticketStatuses.includes(value as TicketStatus);
}

async function createHistoryEntry(client: ReturnType<typeof buildAuthedPocketBase>, ticketId: string, changedBy: string, field: "status" | "priority" | "assigned_to", oldValue: string, newValue: string, changedAt = getCurrentTimestamp()) {
  if (oldValue === newValue) {
    return;
  }

  await client.collection("ticket_history").create({
    changed_at: changedAt,
    changed_by: changedBy,
    field_changed: field,
    new_value: newValue,
    old_value: oldValue,
    ticket_id: ticketId,
  });
}

async function createHistoryEntryWithAdmin(client: Awaited<ReturnType<typeof createAdminPocketBase>>, ticketId: string, changedBy: string, field: "status" | "priority" | "assigned_to", oldValue: string, newValue: string, changedAt = getCurrentTimestamp()) {
  if (oldValue === newValue) {
    return;
  }

  await client.collection("ticket_history").create({
    changed_at: changedAt,
    changed_by: changedBy,
    field_changed: field,
    new_value: newValue,
    old_value: oldValue,
    ticket_id: ticketId,
  });
}

function revalidateTicketPaths(returnPath: string) {
  revalidatePath(returnPath);
  revalidatePath("/app/tickets");
  revalidatePath("/app/agent/tickets");
  revalidatePath("/app/supervisor/tickets");
  revalidatePath("/app/supervisor/dashboard");
}

export async function takeTicketAction(
  _previousState: WorkflowFormState,
  formData: FormData,
): Promise<WorkflowFormState> {
  const session = await requireAuthSession();

  if (session.user.role !== "agente" && session.user.role !== "supervisor") {
    return { formError: "No tienes permisos para tomar tickets." };
  }

  const parsed = takeTicketSchema.safeParse({
    returnPath: formData.get("returnPath"),
    ticketId: formData.get("ticketId"),
  });

  if (!parsed.success) {
    return { formError: "Solicitud invalida." };
  }

  try {
    const client = buildAuthedPocketBase(session);
    const timestamp = getCurrentTimestamp();
    const ticket = (await client.collection("tickets").getOne(parsed.data.ticketId)) as AuthRecord;

    if (ticket.assigned_to) {
      return { formError: "El ticket ya fue tomado por otro usuario." };
    }

    if (!isTicketStatus(ticket.status) || ticket.status !== "new") {
      return { formError: "Solo se pueden tomar tickets en estado new." };
    }

    if (
      session.user.role === "agente" &&
      (!session.user.departmentId || ticket.department_id !== session.user.departmentId)
    ) {
      return { formError: "Solo puedes tomar tickets de tu departamento." };
    }

    await client.collection("tickets").update(ticket.id, {
      assigned_to: session.user.id,
      status: "in_progress",
      updated_at: timestamp,
    });

    await createHistoryEntry(client, ticket.id, session.user.id, "assigned_to", "Sin asignar", session.user.email, timestamp);
    await createHistoryEntry(client, ticket.id, session.user.id, "status", "new", "in_progress", timestamp);
    await touchTicketActivity(client, ticket.id, timestamp);

    if (ticket.created_by && ticket.created_by !== session.user.id) {
      await createNotification({
        href: getTicketRouteForRole("cliente", ticket.id),
        message: "Tu ticket ya fue tomado y paso a in_progress.",
        ticketId: ticket.id,
        title: "Ticket tomado",
        userId: ticket.created_by,
      });
    }

    revalidateTicketPaths(parsed.data.returnPath);
    refresh();
    return { successMessage: "Ticket tomado correctamente." };
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof error.response === "object" &&
      error.response !== null &&
      "message" in error.response &&
      typeof error.response.message === "string"
    ) {
      return { formError: error.response.message };
    }

    return { formError: "No fue posible tomar el ticket." };
  }
}

export async function changeTicketStatusAction(
  _previousState: WorkflowFormState,
  formData: FormData,
): Promise<WorkflowFormState> {
  const session = await requireAuthSession();
  const nextStatus = String(formData.get("nextStatus") ?? "");
  const closeReason = String(formData.get("closeReason") ?? "");
  const closeReasonDetail = String(formData.get("closeReasonDetail") ?? "");
  const resolutionNote = String(formData.get("resolutionNote") ?? "");
  const reopenReason = String(formData.get("reopenReason") ?? "");
  const reopenReasonDetail = String(formData.get("reopenReasonDetail") ?? "");

  if (session.user.role !== "agente" && session.user.role !== "supervisor") {
    return { formError: "No tienes permisos para cambiar estado." };
  }

  const parsed = changeStatusSchema.safeParse({
    nextStatus,
    returnPath: formData.get("returnPath"),
    ticketId: formData.get("ticketId"),
  });

  if (!parsed.success) {
    return {
      formError: "Cambio de estado invalido.",
      values: { closeReason, closeReasonDetail, nextStatus, reopenReason, reopenReasonDetail, resolutionNote },
    };
  }

  try {
    const client = buildAuthedPocketBase(session);
    const timestamp = getCurrentTimestamp();
    const ticket = (await client.collection("tickets").getOne(parsed.data.ticketId)) as AuthRecord;

    if (!isTicketStatus(ticket.status)) {
      return { formError: "El ticket no tiene un estado valido." };
    }

    if (session.user.role === "agente" && ticket.assigned_to !== session.user.id) {
      return { formError: "Solo puedes cambiar estado de tickets asignados a ti." };
    }

    if (!allowedTransitions[ticket.status].includes(parsed.data.nextStatus)) {
      return { formError: `La transicion ${ticket.status} -> ${parsed.data.nextStatus} no es valida.` };
    }

    if (parsed.data.nextStatus === "closed") {
      return {
        formError: "El cierre final debe confirmarlo el cliente desde un ticket resuelto.",
        values: { closeReason, closeReasonDetail, nextStatus, resolutionNote },
      };
    }

    if (parsed.data.nextStatus === "reopened") {
      return {
        formError: "La reapertura debe solicitarla el cliente desde un ticket resuelto.",
        values: { nextStatus, reopenReason, reopenReasonDetail },
      };
    }

    if (parsed.data.nextStatus === "resolved" && !resolutionNote.trim()) {
      return {
        formError: "Ingresa una nota de resolucion antes de marcar el ticket como resuelto.",
        values: { nextStatus, resolutionNote },
      };
    }

    await client.collection("tickets").update(ticket.id, {
      close_reason: ticket.close_reason ?? null,
      close_reason_detail: ticket.close_reason_detail ?? null,
      closed_at: null,
      reopen_reason: ticket.reopen_reason ?? null,
      reopen_reason_detail: ticket.reopen_reason_detail ?? null,
      resolved_at: parsed.data.nextStatus === "resolved" ? timestamp : ticket.resolved_at ?? null,
      resolution_note: parsed.data.nextStatus === "resolved" ? resolutionNote.trim() : ticket.resolution_note ?? null,
      status: parsed.data.nextStatus,
      updated_at: timestamp,
    });

    await createHistoryEntry(client, ticket.id, session.user.id, "status", ticket.status, parsed.data.nextStatus, timestamp);
    if (parsed.data.nextStatus === "resolved") {
      await client.collection("ticket_history").create({
        changed_at: timestamp,
        changed_by: session.user.id,
        field_changed: "status",
        new_value: `Resolucion: ${resolutionNote.trim()}`,
        old_value: ticket.resolution_note || "Sin resolucion previa",
        ticket_id: ticket.id,
      });
    }
    await touchTicketActivity(client, ticket.id, timestamp);

    if (ticket.created_by && ticket.created_by !== session.user.id) {
      await createNotification({
        href: getTicketRouteForRole("cliente", ticket.id),
        message: `Tu ticket cambio a estado ${parsed.data.nextStatus}.`,
        ticketId: ticket.id,
        title: "Cambio de estado",
        userId: ticket.created_by,
      });
    }

    revalidateTicketPaths(parsed.data.returnPath);
    refresh();
    return { successMessage: "Estado actualizado correctamente." };
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof error.response === "object" &&
      error.response !== null &&
      "message" in error.response &&
      typeof error.response.message === "string"
    ) {
      return {
        formError: error.response.message,
        values: { closeReason, closeReasonDetail, nextStatus, reopenReason, reopenReasonDetail, resolutionNote },
      };
    }

    return {
      formError: "No fue posible cambiar el estado del ticket.",
      values: { closeReason, closeReasonDetail, nextStatus, reopenReason, reopenReasonDetail, resolutionNote },
    };
  }
}

export async function respondResolvedTicketAction(
  _previousState: WorkflowFormState,
  formData: FormData,
): Promise<WorkflowFormState> {
  const session = await requireAuthSession();
  const decision = String(formData.get("decision") ?? "");
  const closeReason = String(formData.get("closeReason") ?? "");
  const closeReasonDetail = String(formData.get("closeReasonDetail") ?? "");
  const reopenReason = String(formData.get("reopenReason") ?? "");
  const reopenReasonDetail = String(formData.get("reopenReasonDetail") ?? "");

  if (session.user.role !== "cliente") {
    return { formError: "Solo el cliente puede confirmar cierre o solicitar reapertura." };
  }

  const parsed = customerResolutionSchema.safeParse({
    closeReason,
    closeReasonDetail,
    decision,
    reopenReason,
    reopenReasonDetail,
    returnPath: formData.get("returnPath"),
    ticketId: formData.get("ticketId"),
  });

  if (!parsed.success) {
    return {
      formError: "Respuesta de resolucion invalida.",
      values: { closeReason, closeReasonDetail, reopenReason, reopenReasonDetail },
    };
  }

  try {
    const client = buildAuthedPocketBase(session);
    const adminClient = await createAdminPocketBase();
    const timestamp = getCurrentTimestamp();
    const ticket = (await client.collection("tickets").getOne(parsed.data.ticketId)) as AuthRecord;

    if (ticket.created_by !== session.user.id) {
      return { formError: "No tienes acceso para responder este ticket." };
    }

    if (!isTicketStatus(ticket.status) || ticket.status !== "resolved") {
      return { formError: "Solo puedes responder tickets en estado resolved." };
    }

    if (parsed.data.decision === "close") {
      if (!closeReasons.includes(closeReason as CloseReason)) {
        return {
          formError: "Selecciona un motivo de cierre valido.",
          values: { closeReason, closeReasonDetail },
        };
      }

      if (closeReason === "otro" && !closeReasonDetail.trim()) {
        return {
          formError: "Describe el motivo de cierre cuando eliges 'otro'.",
          values: { closeReason, closeReasonDetail },
        };
      }

      await adminClient.collection("tickets").update(ticket.id, {
        close_reason: closeReason,
        close_reason_detail: closeReasonDetail.trim() || null,
        closed_at: timestamp,
        reopen_reason: ticket.reopen_reason ?? null,
        reopen_reason_detail: ticket.reopen_reason_detail ?? null,
        resolved_at: ticket.resolved_at ?? null,
        resolution_note: ticket.resolution_note ?? null,
        status: "closed",
        updated_at: timestamp,
      });

      await createHistoryEntryWithAdmin(adminClient, ticket.id, session.user.id, "status", ticket.status, "closed", timestamp);
      await adminClient.collection("ticket_history").create({
        changed_at: timestamp,
        changed_by: session.user.id,
        field_changed: "status",
        new_value: `Motivo de cierre: ${closeReason}`,
        old_value: ticket.close_reason || "Sin motivo previo",
        ticket_id: ticket.id,
      });

      if (ticket.assigned_to) {
        await createNotification({
          href: getTicketRouteForRole("agente", ticket.id),
          message: "El cliente confirmo el cierre del ticket resuelto.",
          ticketId: ticket.id,
          title: "Ticket cerrado por cliente",
          userId: ticket.assigned_to,
        });
      }
    }

    if (parsed.data.decision === "reopen") {
      if (!reopenReasons.includes(reopenReason as ReopenReason)) {
        return {
          formError: "Selecciona un motivo de reapertura valido.",
          values: { reopenReason, reopenReasonDetail },
        };
      }

      if (reopenReason === "otro" && !reopenReasonDetail.trim()) {
        return {
          formError: "Describe el motivo de reapertura cuando eliges 'otro'.",
          values: { reopenReason, reopenReasonDetail },
        };
      }

      await adminClient.collection("tickets").update(ticket.id, {
        close_reason: ticket.close_reason ?? null,
        close_reason_detail: ticket.close_reason_detail ?? null,
        closed_at: null,
        resolved_at: null,
        reopen_reason: reopenReason,
        reopen_reason_detail: reopenReasonDetail.trim() || null,
        resolution_note: ticket.resolution_note ?? null,
        status: "reopened",
        updated_at: timestamp,
      });

      await createHistoryEntryWithAdmin(adminClient, ticket.id, session.user.id, "status", ticket.status, "reopened", timestamp);
      await adminClient.collection("ticket_history").create({
        changed_at: timestamp,
        changed_by: session.user.id,
        field_changed: "status",
        new_value: `Motivo de reapertura: ${reopenReason}`,
        old_value: ticket.reopen_reason || "Sin motivo previo",
        ticket_id: ticket.id,
      });

      if (ticket.assigned_to) {
        await createNotification({
          href: getTicketRouteForRole("agente", ticket.id),
          message: "El cliente solicito reapertura sobre un ticket resuelto.",
          ticketId: ticket.id,
          title: "Ticket reabierto por cliente",
          userId: ticket.assigned_to,
        });
      }
    }

    await touchTicketActivity(client, ticket.id, timestamp);

    revalidateTicketPaths(parsed.data.returnPath);
    refresh();
    return {
      successMessage:
        parsed.data.decision === "close"
          ? "Confirmaste el cierre del ticket correctamente."
          : "Solicitaste la reapertura del ticket correctamente.",
    };
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof error.response === "object" &&
      error.response !== null &&
      "message" in error.response &&
      typeof error.response.message === "string"
    ) {
      return {
        formError: error.response.message,
        values: { closeReason, closeReasonDetail, reopenReason, reopenReasonDetail },
      };
    }

    return {
      formError: "No fue posible responder el ticket resuelto.",
      values: { closeReason, closeReasonDetail, reopenReason, reopenReasonDetail },
    };
  }
}

export async function reassignTicketAction(
  _previousState: WorkflowFormState,
  formData: FormData,
): Promise<WorkflowFormState> {
  const session = await requireAuthSession();
  const assigneeId = String(formData.get("assigneeId") ?? "");

  if (session.user.role !== "agente" && session.user.role !== "supervisor") {
    return { formError: "No tienes permisos para reasignar tickets." };
  }

  const parsed = reassignTicketSchema.safeParse({
    assigneeId,
    returnPath: formData.get("returnPath"),
    ticketId: formData.get("ticketId"),
  });

  if (!parsed.success) {
    return { formError: "Reasignacion invalida.", values: { assigneeId } };
  }

  try {
    const client = buildAuthedPocketBase(session);
    const timestamp = getCurrentTimestamp();
    const [ticket, assignee] = (await Promise.all([
      client.collection("tickets").getOne(parsed.data.ticketId),
      client.collection("users").getOne(parsed.data.assigneeId),
    ])) as [AuthRecord, AuthRecord];

    if (!ticket.department_id) {
      return { formError: "El ticket no tiene departamento valido." };
    }

    if (assignee.role !== "agente" || assignee.department_id !== ticket.department_id) {
      return { formError: "La reasignacion solo permite agentes del mismo departamento." };
    }

    if (session.user.role === "agente") {
      if (ticket.assigned_to !== session.user.id) {
        return { formError: "Solo puedes reasignar tickets actualmente asignados a ti." };
      }

      if (session.user.departmentId && session.user.departmentId !== ticket.department_id) {
        return { formError: "Solo puedes reasignar tickets de tu departamento." };
      }
    }

    await client.collection("tickets").update(ticket.id, {
      assigned_to: assignee.id,
      updated_at: timestamp,
    });

    await createHistoryEntry(
      client,
      ticket.id,
      session.user.id,
      "assigned_to",
      ticket.assigned_to || "Sin asignar",
      assignee.email || assignee.id,
      timestamp,
    );

    await touchTicketActivity(client, ticket.id, timestamp);

    if (ticket.created_by && ticket.created_by !== session.user.id) {
      await createNotification({
        href: getTicketRouteForRole("cliente", ticket.id),
        message: "Tu ticket fue reasignado para seguimiento operativo.",
        ticketId: ticket.id,
        title: "Ticket reasignado",
        userId: ticket.created_by,
      });
    }

    if (assignee.id !== session.user.id) {
      await createNotification({
        href: getTicketRouteForRole("agente", ticket.id),
        message: "Se te asigno un ticket para seguimiento.",
        ticketId: ticket.id,
        title: "Nuevo ticket asignado",
        userId: assignee.id,
      });
    }

    revalidateTicketPaths(parsed.data.returnPath);
    refresh();
    return { successMessage: "Ticket reasignado correctamente." };
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof error.response === "object" &&
      error.response !== null &&
      "message" in error.response &&
      typeof error.response.message === "string"
    ) {
      return { formError: error.response.message, values: { assigneeId } };
    }

    return { formError: "No fue posible reasignar el ticket.", values: { assigneeId } };
  }
}
