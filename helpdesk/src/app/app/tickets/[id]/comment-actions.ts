"use server";

import { refresh, revalidatePath } from "next/cache";
import { z } from "zod";

import { getTicketRouteForRole } from "@/lib/auth";
import { requireAuthSession } from "@/lib/auth-server";
import { buildAuthedPocketBase, createNotification, getAttachmentFiles, getCurrentTimestamp, touchTicketActivity, validateAttachments } from "@/lib/helpdesk-actions";

const commentSchema = z.object({
  content: z.string().trim().min(1, "El comentario es obligatorio."),
  isInternal: z.enum(["false", "true"]).default("false"),
  returnPath: z.string().trim().min(1),
  ticketId: z.string().trim().min(1),
});

export type CommentFormState = {
  formError?: string;
  successMessage?: string;
  values?: {
    attachmentNames?: string[];
    content: string;
    isInternal: boolean;
  };
};

type TicketContextRecord = {
  assigned_to?: string;
  status?: string;
  created_by?: string;
  department_id?: string;
  id: string;
};

function canCommentTicket(ticket: TicketContextRecord, session: Awaited<ReturnType<typeof requireAuthSession>>) {
  if (session.user.role === "supervisor") {
    return true;
  }

  if (session.user.role === "cliente") {
    return ticket.created_by === session.user.id;
  }

  if (session.user.role === "agente") {
    return (
      ticket.assigned_to === session.user.id ||
      (!ticket.assigned_to && !!session.user.departmentId && ticket.department_id === session.user.departmentId)
    );
  }

  return false;
}

export async function createCommentAction(
  _previousState: CommentFormState,
  formData: FormData,
): Promise<CommentFormState> {
  const session = await requireAuthSession();
  const attachments = getAttachmentFiles(formData, "attachments");
  const values = {
    attachmentNames: attachments.map((file) => file.name),
    content: String(formData.get("content") ?? ""),
    isInternal: (formData.get("isInternal") ?? "false") === "true",
  };
  const attachmentsError = validateAttachments(attachments);

  if (attachmentsError) {
    return {
      formError: attachmentsError,
      values,
    };
  }

  const parsed = commentSchema.safeParse({
    content: values.content,
    isInternal: values.isInternal ? "true" : "false",
    returnPath: formData.get("returnPath"),
    ticketId: formData.get("ticketId"),
  });

  if (!parsed.success) {
    return {
      formError: parsed.error.flatten().formErrors[0] ?? "Datos de comentario invalidos.",
      values,
    };
  }

  const wantsInternal = parsed.data.isInternal === "true";

  if (wantsInternal && session.user.role === "cliente") {
    return { formError: "Los clientes no pueden crear comentarios internos.", values };
  }

  try {
    const client = buildAuthedPocketBase(session);
    const timestamp = getCurrentTimestamp();
    const ticket = (await client.collection("tickets").getOne(parsed.data.ticketId)) as TicketContextRecord;

    if (!canCommentTicket(ticket, session)) {
      return { formError: "No tienes acceso para comentar este ticket.", values };
    }

    if (ticket.status === "closed") {
      return { formError: "Los tickets cerrados ya no aceptan comentarios nuevos.", values };
    }

    await client.collection("comments").create({
      attachments,
      author_id: session.user.id,
      content: parsed.data.content,
      created_at: timestamp,
      is_internal: wantsInternal,
      ticket_id: parsed.data.ticketId,
      updated_at: timestamp,
    });

    await touchTicketActivity(client, parsed.data.ticketId, timestamp);

    if (!wantsInternal && ticket.created_by && ticket.created_by !== session.user.id) {
      await createNotification({
        href: getTicketRouteForRole("cliente", parsed.data.ticketId),
        message: "Hay un comentario publico nuevo en uno de tus tickets.",
        ticketId: parsed.data.ticketId,
        title: "Nuevo comentario",
        userId: ticket.created_by,
      });
    }

    revalidatePath(parsed.data.returnPath);
    refresh();
    return { successMessage: "Comentario agregado correctamente." };
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
      return { formError: error.response.message, values };
    }

    return { formError: "No fue posible registrar el comentario.", values };
  }
}
