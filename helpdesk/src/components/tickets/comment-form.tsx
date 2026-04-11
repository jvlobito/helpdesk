"use client";

import { useEffect, useRef, useState } from "react";
import { useActionState } from "react";

import type { UserRole } from "@/lib/helpdesk";

import { createCommentAction, type CommentFormState } from "@/app/app/tickets/[id]/comment-actions";

const initialState: CommentFormState = {};

type CommentFormProps = {
  allowInternal: boolean;
  role: UserRole;
  returnPath: string;
  ticketId: string;
};

export function CommentForm({ allowInternal, role, returnPath, ticketId }: CommentFormProps) {
  const [state, formAction, isPending] = useActionState(createCommentAction, initialState);
  const [clientError, setClientError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function validateSelectedFiles(form: HTMLFormElement) {
    const fileInput = form.elements.namedItem("attachments");

    if (!(fileInput instanceof HTMLInputElement) || !fileInput.files) {
      return null;
    }

    const files = Array.from(fileInput.files);

    if (files.length > 3) {
      return "Puedes adjuntar hasta 3 archivos por comentario.";
    }

    const oversized = files.find((file) => file.size > 5 * 1024 * 1024);
    return oversized ? `El archivo ${oversized.name} supera el limite de 5 MB.` : null;
  }

  useEffect(() => {
    if (state.successMessage) {
      formRef.current?.reset();
    }
  }, [state.successMessage]);

  return (
    <form
      ref={formRef}
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
      className="relative mt-6 space-y-4 rounded-2xl border border-white/8 bg-slate-950/60 p-4"
    >
      <input type="hidden" name="ticketId" value={ticketId} />
      <input type="hidden" name="returnPath" value={returnPath} />

      {isPending ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl border border-emerald-400/20 bg-slate-950/85 backdrop-blur-sm">
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-4 text-center text-sm text-emerald-100">
            <p className="font-medium">Guardando comentario...</p>
            <p className="mt-1 text-emerald-200/80">Estamos registrando la informacion y los adjuntos.</p>
          </div>
        </div>
      ) : null}

      <label className="block space-y-2 text-sm text-slate-300">
        <span>Nuevo comentario</span>
        <textarea
          name="content"
          rows={4}
          defaultValue={state.values?.content ?? ""}
          className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3"
          placeholder="Escribe el siguiente avance o detalle relevante"
        />
      </label>

      <label className="block space-y-2 text-sm text-slate-300">
        <span>Adjuntos opcionales</span>
        <input
          type="file"
          name="attachments"
          multiple
          onChange={(event) => setClientError(validateSelectedFiles(event.currentTarget.form ?? formRef.current ?? document.createElement("form")))}
          className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm"
        />
        <p className="text-xs text-slate-500">Hasta 3 archivos de 5 MB cada uno.</p>
        {state.values?.attachmentNames?.length ? (
          <p className="text-xs text-slate-400">Seleccionados previamente: {state.values.attachmentNames.join(", ")}</p>
        ) : null}
      </label>

      {allowInternal ? (
        <div className="space-y-2">
          <label className="flex items-center gap-3 text-sm text-slate-300">
            <input
              type="checkbox"
              name="isInternal"
              value="true"
              defaultChecked={state.values?.isInternal ?? false}
              className="h-4 w-4 rounded border-white/20"
            />
            <span>Marcar como comentario interno ({role})</span>
          </label>
          <p className="text-xs text-slate-500">Si no marcas esta opcion, el comentario sera publico y tambien sera visible para el cliente.</p>
        </div>
      ) : null}

      {state.successMessage ? (
        <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
          {state.successMessage}
        </div>
      ) : null}

      {clientError ? (
        <div className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {clientError}
        </div>
      ) : null}

      {state.formError ? (
        <div className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {state.formError}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Guardando comentario..." : "Agregar comentario"}
      </button>
    </form>
  );
}
