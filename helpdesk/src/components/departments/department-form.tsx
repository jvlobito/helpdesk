"use client";

import { useEffect, useRef } from "react";
import { useActionState } from "react";

import type { DepartmentView } from "@/lib/helpdesk-server";

import {
  createDepartmentAction,
  type DepartmentFormState,
  updateDepartmentAction,
} from "@/app/app/supervisor/departments/actions";

const initialState: DepartmentFormState = {};

type DepartmentFormProps = {
  department?: DepartmentView;
  mode: "create" | "edit";
};

export function DepartmentForm({ department, mode }: DepartmentFormProps) {
  const action = mode === "create" ? createDepartmentAction : updateDepartmentAction;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const buttonLabel = mode === "create" ? "Crear departamento" : "Guardar cambios";

  useEffect(() => {
    if (state.successMessage) {
      formRef.current?.reset();
    }
  }, [state.successMessage]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4 rounded-3xl border border-white/10 bg-card p-6">
      {department ? <input type="hidden" name="departmentId" value={department.id} /> : null}

      <div>
        <p className="text-sm font-medium text-emerald-300">
          {mode === "create" ? "Nuevo departamento" : "Editar departamento"}
        </p>
      </div>

      <label className="block space-y-2 text-sm text-slate-300">
        <span>Nombre</span>
        <input
          name="name"
          defaultValue={state.values?.name ?? department?.name ?? ""}
          className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3"
        />
      </label>

      <label className="block space-y-2 text-sm text-slate-300">
        <span>Email de contacto</span>
        <input
          type="email"
          name="contactEmail"
          defaultValue={state.values?.contactEmail ?? department?.contactEmail ?? ""}
          className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3"
        />
      </label>

      <label className="block space-y-2 text-sm text-slate-300">
        <span>Descripcion</span>
        <textarea
          name="description"
          rows={4}
          defaultValue={state.values?.description ?? department?.description ?? ""}
          className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3"
        />
      </label>

      <label className="block space-y-2 text-sm text-slate-300">
        <span>Estado</span>
        <select
          name="active"
          defaultValue={state.values?.active ?? (department ? String(department.active) : "true")}
          className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3"
        >
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
        {isPending ? "Guardando..." : buttonLabel}
      </button>
    </form>
  );
}
