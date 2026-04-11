"use client";

import { useState } from "react";
import { useActionState } from "react";

import type { DepartmentView } from "@/lib/helpdesk-server";
import { ticketCategories, ticketPriorities } from "@/lib/helpdesk";

import { createTicketAction, type CreateTicketFormState } from "@/app/app/tickets/new/actions";

const initialState: CreateTicketFormState = {};

type NewTicketFormProps = {
  departments: DepartmentView[];
};

export function NewTicketForm({ departments }: NewTicketFormProps) {
  const [state, formAction, isPending] = useActionState(createTicketAction, initialState);
  const [clientError, setClientError] = useState<string | null>(null);
  const hasDepartments = departments.length > 0;

  function validateSelectedFiles(form: HTMLFormElement) {
    const fileInput = form.elements.namedItem("attachments");

    if (!(fileInput instanceof HTMLInputElement) || !fileInput.files) {
      return null;
    }

    const files = Array.from(fileInput.files);

    if (files.length > 3) {
      return "Puedes adjuntar hasta 3 archivos.";
    }

    const oversized = files.find((file) => file.size > 5 * 1024 * 1024);
    return oversized ? `El archivo ${oversized.name} supera el limite de 5 MB.` : null;
  }

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        const nextError = validateSelectedFiles(event.currentTarget);

        if (nextError) {
          event.preventDefault();
          setClientError(nextError);
          return;
        }

        setClientError(null);
      }}
      className="grid gap-4 rounded-3xl border border-white/10 bg-card p-6 md:grid-cols-2"
    >
      <label className="space-y-2 text-sm text-slate-300 md:col-span-2">
        <span>Titulo</span>
        <input
          name="title"
          defaultValue={state.values?.title ?? ""}
          className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3"
        />
        {state.errors?.title ? <p className="text-xs text-rose-300">{state.errors.title}</p> : null}
      </label>

      <label className="space-y-2 text-sm text-slate-300">
        <span>Prioridad</span>
        <select
          name="priority"
          defaultValue={state.values?.priority || "medium"}
          className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 capitalize"
        >
          {ticketPriorities.map((priority) => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </select>
        {state.errors?.priority ? <p className="text-xs text-rose-300">{state.errors.priority}</p> : null}
      </label>

      <label className="space-y-2 text-sm text-slate-300">
        <span>Categoria</span>
        <select
          name="category"
          defaultValue={state.values?.category || "hardware"}
          className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 capitalize"
        >
          {ticketCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        {state.errors?.category ? <p className="text-xs text-rose-300">{state.errors.category}</p> : null}
      </label>

      <label className="space-y-2 text-sm text-slate-300 md:col-span-2">
        <span>Departamento</span>
        <select
          name="departmentId"
          defaultValue={state.values?.departmentId ?? ""}
          disabled={!hasDepartments}
          className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="">Selecciona un departamento</option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </select>
        {!hasDepartments ? <p className="text-xs text-amber-300">No hay departamentos disponibles.</p> : null}
        {state.errors?.departmentId ? <p className="text-xs text-rose-300">{state.errors.departmentId}</p> : null}
      </label>

      <label className="space-y-2 text-sm text-slate-300 md:col-span-2">
        <span>Descripcion</span>
        <textarea
          name="description"
          rows={6}
          defaultValue={state.values?.description ?? ""}
          className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3"
          placeholder="Describe el problema, impacto y pasos para reproducirlo"
        />
        {state.errors?.description ? <p className="text-xs text-rose-300">{state.errors.description}</p> : null}
      </label>

      <label className="space-y-2 text-sm text-slate-300 md:col-span-2">
        <span>Adjuntos opcionales</span>
        <input
          type="file"
          name="attachments"
          multiple
          onChange={(event) => setClientError(validateSelectedFiles(event.currentTarget.form ?? document.createElement("form")))}
          className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm"
        />
        <p className="text-xs text-slate-500">Hasta 3 archivos de 5 MB cada uno.</p>
        {state.values?.attachmentNames?.length ? (
          <p className="text-xs text-slate-400">Seleccionados previamente: {state.values.attachmentNames.join(", ")}</p>
        ) : null}
      </label>

      {clientError ? (
        <div className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100 md:col-span-2">
          {clientError}
        </div>
      ) : null}

      {state.formError ? (
        <div className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100 md:col-span-2">
          {state.formError}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending || !hasDepartments}
        className="rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-70 md:col-span-2"
      >
        {isPending ? "Creando ticket..." : "Crear ticket"}
      </button>
    </form>
  );
}
