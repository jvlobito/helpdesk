"use client";

import { useActionState } from "react";

import { updateInternalUserAction, type InternalUserFormState } from "@/app/app/supervisor/users/actions";
import type { DepartmentView, InternalUserView } from "@/lib/helpdesk-server";

const initialState: InternalUserFormState = {};

type InternalUserFormProps = {
  departments: DepartmentView[];
  user: InternalUserView;
};

export function InternalUserForm({ departments, user }: InternalUserFormProps) {
  const [state, formAction, isPending] = useActionState(updateInternalUserAction, initialState);

  return (
    <form
      key={`${user.id}:${user.role}:${user.departmentId ?? "none"}:${user.active ? "active" : "inactive"}`}
      action={formAction}
      className="space-y-4 rounded-3xl border border-white/10 bg-card p-6"
    >
      <input type="hidden" name="userId" value={user.id} />

      <div>
        <p className="text-sm font-medium text-emerald-300">Usuario interno</p>
        <h3 className="mt-2 text-xl font-semibold text-white">{user.name}</h3>
        <p className="mt-1 text-sm text-slate-400">{user.email}</p>
      </div>

      <label className="block space-y-2 text-sm text-slate-300">
        <span>Rol</span>
        <select name="role" defaultValue={user.role} className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3">
          <option value="agente">Agente</option>
          <option value="supervisor">Supervisor</option>
        </select>
      </label>

      <label className="block space-y-2 text-sm text-slate-300">
        <span>Departamento</span>
        <select name="departmentId" defaultValue={user.departmentId ?? ""} className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3">
          <option value="">Sin departamento</option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-2 text-sm text-slate-300">
        <span>Estado</span>
        <select name="active" defaultValue={String(user.active)} className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3">
          <option value="true">Activo</option>
          <option value="false">Inactivo</option>
        </select>
      </label>

      {state.formError ? (
        <div className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {state.formError}
        </div>
      ) : null}

      {state.successMessage ? (
        <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
          {state.successMessage}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Guardando..." : "Actualizar usuario"}
      </button>
    </form>
  );
}
