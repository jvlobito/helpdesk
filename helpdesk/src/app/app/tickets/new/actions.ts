"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import PocketBase from "pocketbase";
import { z } from "zod";

import { requireAuthSession } from "@/lib/auth-server";
import { buildAuthedPocketBase, getAttachmentFiles, getCurrentTimestamp, validateAttachments } from "@/lib/helpdesk-actions";
import { pocketbaseUrl } from "@/lib/pocketbase";

const createTicketSchema = z.object({
  title: z.string().trim().min(1, "El titulo es obligatorio.").max(200, "Maximo 200 caracteres."),
  description: z.string().trim().min(1, "La descripcion es obligatoria."),
  priority: z.enum(["low", "medium", "high", "critical"]),
  category: z.enum(["hardware", "software", "network", "other"]),
  departmentId: z.string().trim().min(1, "Selecciona un departamento."),
});

export type CreateTicketFormState = {
  errors?: Partial<Record<keyof z.infer<typeof createTicketSchema>, string>>;
  formError?: string;
  values?: {
    attachmentNames?: string[];
    category: string;
    departmentId: string;
    description: string;
    priority: string;
    title: string;
  };
};

async function getNextTicketNumber() {
  const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
  const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error("Faltan credenciales admin de PocketBase para calcular ticket_number global.");
  }

  const client = new PocketBase(pocketbaseUrl);
  client.autoCancellation(false);
  await client.collection("_superusers").authWithPassword(adminEmail, adminPassword);

  const records = await client.collection("tickets").getFullList({
    fields: "ticket_number",
  });

  const latestSequence = records.reduce((max, record) => {
    const ticketNumber = typeof record.ticket_number === "string" ? record.ticket_number : "";
    const numericPart = ticketNumber.match(/(\d+)$/)?.[1];

    if (!numericPart) {
      return max;
    }

    const sequence = Number.parseInt(numericPart, 10);
    return Number.isNaN(sequence) ? max : Math.max(max, sequence);
  }, 0);

  const nextSequence = latestSequence + 1;
  return `TKT-${String(nextSequence).padStart(5, "0")}`;
}

export async function createTicketAction(
  _previousState: CreateTicketFormState,
  formData: FormData,
): Promise<CreateTicketFormState> {
  const session = await requireAuthSession();
  const attachments = getAttachmentFiles(formData, "attachments");
  const values = {
    attachmentNames: attachments.map((file) => file.name),
    category: String(formData.get("category") ?? ""),
    departmentId: String(formData.get("departmentId") ?? ""),
    description: String(formData.get("description") ?? ""),
    priority: String(formData.get("priority") ?? ""),
    title: String(formData.get("title") ?? ""),
  };

  if (session.user.role !== "cliente") {
    return { formError: "Solo clientes pueden crear tickets desde esta vista." };
  }

  const attachmentsError = validateAttachments(attachments);

  if (attachmentsError) {
    return { formError: attachmentsError, values };
  }

  const parsed = createTicketSchema.safeParse(values);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    return {
      errors: {
        category: fieldErrors.category?.[0],
        departmentId: fieldErrors.departmentId?.[0],
        description: fieldErrors.description?.[0],
        priority: fieldErrors.priority?.[0],
        title: fieldErrors.title?.[0],
      },
      values,
      formError: "Corrige los campos marcados e intenta de nuevo.",
    };
  }

  try {
    const client = buildAuthedPocketBase(session);
    const [ticketNumber, timestamp] = await Promise.all([getNextTicketNumber(), Promise.resolve(getCurrentTimestamp())]);
    const department = await client.collection("departments").getOne(parsed.data.departmentId);

    if (department.active !== true) {
      return {
        formError: "El departamento seleccionado ya no esta activo. Elige otro para crear el ticket.",
        values,
      };
    }

    await client.collection("tickets").create({
      attachments,
      category: parsed.data.category,
      created_at: timestamp,
      created_by: session.user.id,
      department_id: parsed.data.departmentId,
      description: parsed.data.description,
      priority: parsed.data.priority,
      status: "new",
      ticket_number: ticketNumber,
      title: parsed.data.title,
      updated_at: timestamp,
    });
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

    return { formError: "No fue posible crear el ticket.", values };
  }

  revalidatePath("/app/tickets");
  revalidatePath("/app/tickets/new");
  redirect("/app/tickets?created=1");
}
