"use server";

import { refresh, revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAuthSession } from "@/lib/auth-server";
import { buildAuthedPocketBase, getCurrentTimestamp } from "@/lib/helpdesk-actions";

const userSchema = z.object({
  active: z.enum(["true", "false"]),
  departmentId: z.string().optional(),
  role: z.enum(["agente", "supervisor"]),
  userId: z.string().trim().min(1),
});

export type InternalUserFormState = {
  formError?: string;
  successMessage?: string;
};

function revalidateUserViews() {
  revalidatePath("/app/supervisor/users");
  revalidatePath("/app/supervisor/dashboard");
  revalidatePath("/app/agent/tickets");
  revalidatePath("/app/supervisor/tickets");
}

export async function updateInternalUserAction(
  _previousState: InternalUserFormState,
  formData: FormData,
): Promise<InternalUserFormState> {
  const session = await requireAuthSession();

  if (session.user.role !== "supervisor") {
    return { formError: "Solo un supervisor puede actualizar usuarios internos." };
  }

  const parsed = userSchema.safeParse({
    active: formData.get("active") ?? "true",
    departmentId: String(formData.get("departmentId") ?? ""),
    role: formData.get("role"),
    userId: formData.get("userId"),
  });

  if (!parsed.success) {
    return { formError: "Datos de usuario invalidos." };
  }

  try {
    const client = buildAuthedPocketBase(session);
    const currentUser = await client.collection("users").getOne(parsed.data.userId);

    if (currentUser.role === "cliente") {
      return { formError: "Esta vista solo administra usuarios internos." };
    }

    const nextRole = parsed.data.role;
    const nextDepartmentId = nextRole === "supervisor" ? "" : parsed.data.departmentId ?? "";

    if (nextRole === "agente" && !nextDepartmentId) {
      return { formError: "Los agentes deben quedar asignados a un departamento." };
    }

    await client.collection("users").update(parsed.data.userId, {
      active: parsed.data.active === "true",
      department_id: nextDepartmentId,
      role: nextRole,
      updated: getCurrentTimestamp(),
    });

    revalidateUserViews();
    refresh();
    return { successMessage: "Usuario actualizado correctamente." };
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

    return { formError: "No fue posible actualizar el usuario." };
  }
}
