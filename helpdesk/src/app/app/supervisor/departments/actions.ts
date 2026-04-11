"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAuthSession } from "@/lib/auth-server";
import { buildAuthedPocketBase, getCurrentTimestamp } from "@/lib/helpdesk-actions";

const departmentSchema = z.object({
  active: z.enum(["true", "false"]),
  contactEmail: z.email("Ingresa un email valido."),
  description: z.string().trim().optional(),
  name: z.string().trim().min(1, "El nombre es obligatorio."),
});

export type DepartmentFormState = {
  formError?: string;
  successMessage?: string;
  values?: {
    active: "true" | "false";
    contactEmail: string;
    description: string;
    name: string;
  };
};

function revalidateDepartmentViews() {
  revalidatePath("/app/supervisor/departments");
  revalidatePath("/app/supervisor/dashboard");
}

export async function createDepartmentAction(
  _previousState: DepartmentFormState,
  formData: FormData,
): Promise<DepartmentFormState> {
  const session = await requireAuthSession();
  const values = {
    active: (formData.get("active") ?? "true") === "false" ? "false" as const : "true" as const,
    contactEmail: String(formData.get("contactEmail") ?? ""),
    description: String(formData.get("description") ?? ""),
    name: String(formData.get("name") ?? ""),
  };

  if (session.user.role !== "supervisor") {
    return { formError: "Solo un supervisor puede crear departamentos." };
  }

  const parsed = departmentSchema.safeParse(values);

  if (!parsed.success) {
    return {
      formError: parsed.error.flatten().formErrors[0] ?? "Datos de departamento invalidos.",
      values,
    };
  }

  try {
    const client = buildAuthedPocketBase(session);
    const timestamp = getCurrentTimestamp();

    await client.collection("departments").create({
      active: parsed.data.active === "true",
      contact_email: parsed.data.contactEmail,
      created_at: timestamp,
      description: parsed.data.description ?? "",
      name: parsed.data.name,
      updated_at: timestamp,
    });

    revalidateDepartmentViews();
    return {
      successMessage: "Departamento creado correctamente.",
      values: {
        active: "true",
        contactEmail: "",
        description: "",
        name: "",
      },
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
      return { formError: error.response.message, values };
    }

    return { formError: "No fue posible crear el departamento.", values };
  }
}

export async function updateDepartmentAction(
  _previousState: DepartmentFormState,
  formData: FormData,
): Promise<DepartmentFormState> {
  const session = await requireAuthSession();
  const values = {
    active: (formData.get("active") ?? "true") === "false" ? "false" as const : "true" as const,
    contactEmail: String(formData.get("contactEmail") ?? ""),
    description: String(formData.get("description") ?? ""),
    name: String(formData.get("name") ?? ""),
  };

  if (session.user.role !== "supervisor") {
    return { formError: "Solo un supervisor puede editar departamentos." };
  }

  const departmentId = formData.get("departmentId");

  if (typeof departmentId !== "string" || !departmentId) {
    return { formError: "Departamento invalido." };
  }

  const parsed = departmentSchema.safeParse(values);

  if (!parsed.success) {
    return {
      formError: parsed.error.flatten().formErrors[0] ?? "Datos de departamento invalidos.",
      values,
    };
  }

  try {
    const client = buildAuthedPocketBase(session);
    const currentDepartment = await client.collection("departments").getOne(departmentId);
    const nextActive = parsed.data.active === "true";

    if (currentDepartment.active === true && !nextActive) {
      const openTickets = await client.collection("tickets").getList(1, 1, {
        filter: `department_id = "${departmentId}" && status != "closed"`,
      });

      if (openTickets.totalItems > 0) {
        return {
          formError: "No puedes desactivar un departamento con tickets abiertos. Cierra o reasigna esos tickets primero.",
          values,
        };
      }
    }

    await client.collection("departments").update(departmentId, {
      active: nextActive,
      contact_email: parsed.data.contactEmail,
      description: parsed.data.description ?? "",
      name: parsed.data.name,
      updated_at: getCurrentTimestamp(),
    });

    revalidateDepartmentViews();
    return { successMessage: "Departamento actualizado correctamente.", values };
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

    return { formError: "No fue posible actualizar el departamento.", values };
  }
}
