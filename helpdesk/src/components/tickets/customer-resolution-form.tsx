"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import { respondResolvedTicketAction, type WorkflowFormState } from "@/app/app/tickets/[id]/workflow-actions";
import { closeReasonLabels, closeReasons, reopenReasonLabels, reopenReasons } from "@/lib/helpdesk";

const initialState: WorkflowFormState = {};

type CustomerResolutionFormProps = {
  returnPath: string;
  ticketId: string;
};

export function CustomerResolutionForm({ returnPath, ticketId }: CustomerResolutionFormProps) {
  const [state, formAction, isPending] = useActionState(respondResolvedTicketAction, initialState);
  const [decision, setDecision] = useState("");
  const [selectedCloseReason, setSelectedCloseReason] = useState("");
  const [selectedReopenReason, setSelectedReopenReason] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const activeDecision = state.successMessage ? "" : decision;
  const closeReasonValue = state.successMessage ? "" : selectedCloseReason || state.values?.closeReason || "";
  const reopenReasonValue = state.successMessage ? "" : selectedReopenReason || state.values?.reopenReason || "";
  const needsCloseReasonDetail = activeDecision === "close" && closeReasonValue === "otro";
  const needsReopenReasonDetail = activeDecision === "reopen" && reopenReasonValue === "otro";

  useEffect(() => {
    if (state.successMessage) {
      formRef.current?.reset();
    }
  }, [state.successMessage]);

  return (
    <form ref={formRef} action={formAction} className="mt-6 space-y-4 rounded-2xl border border-white/8 bg-slate-950/60 p-4">
      <input type="hidden" name="ticketId" value={ticketId} />
      <input type="hidden" name="returnPath" value={returnPath} />

      <div className="space-y-2 text-sm text-slate-300">
        <p className="font-medium text-white">Respuesta del cliente sobre ticket resuelto</p>
        <p className="text-slate-400">Si la solucion fue suficiente puedes confirmar el cierre. Si el problema persiste, solicita la reapertura.</p>
      </div>

      <label className="block space-y-2 text-sm text-slate-300">
        <span>Decision</span>
        <select
          name="decision"
          value={activeDecision}
          onChange={(event) => setDecision(event.target.value)}
          className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3"
        >
          <option value="" disabled>
            Selecciona una decision
          </option>
          <option value="close">Confirmar cierre</option>
          <option value="reopen">Solicitar reapertura</option>
        </select>
      </label>

      {activeDecision === "close" ? (
        <div className="space-y-3 rounded-2xl border border-white/8 bg-slate-900/60 p-4">
          <label className="block space-y-2 text-sm text-slate-300">
            <span>Motivo de cierre</span>
            <select
              name="closeReason"
              value={closeReasonValue}
              onChange={(event) => setSelectedCloseReason(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3"
            >
              <option value="" disabled>
                Selecciona un motivo de cierre
              </option>
              {closeReasons.map((reason) => (
                <option key={reason} value={reason}>
                  {closeReasonLabels[reason]}
                </option>
              ))}
            </select>
          </label>
          {needsCloseReasonDetail ? (
            <label className="block space-y-2 text-sm text-slate-300">
              <span>Detalle del motivo de cierre</span>
              <textarea
                name="closeReasonDetail"
                rows={3}
                defaultValue={state.values?.closeReasonDetail ?? ""}
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3"
              />
            </label>
          ) : null}
        </div>
      ) : null}

      {activeDecision === "reopen" ? (
        <div className="space-y-3 rounded-2xl border border-white/8 bg-slate-900/60 p-4">
          <label className="block space-y-2 text-sm text-slate-300">
            <span>Motivo de reapertura</span>
            <select
              name="reopenReason"
              value={reopenReasonValue}
              onChange={(event) => setSelectedReopenReason(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3"
            >
              <option value="" disabled>
                Selecciona un motivo de reapertura
              </option>
              {reopenReasons.map((reason) => (
                <option key={reason} value={reason}>
                  {reopenReasonLabels[reason]}
                </option>
              ))}
            </select>
          </label>
          {needsReopenReasonDetail ? (
            <label className="block space-y-2 text-sm text-slate-300">
              <span>Detalle del motivo de reapertura</span>
              <textarea
                name="reopenReasonDetail"
                rows={3}
                defaultValue={state.values?.reopenReasonDetail ?? ""}
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3"
              />
            </label>
          ) : null}
        </div>
      ) : null}

      {state.successMessage ? (
        <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
          {state.successMessage}
        </div>
      ) : null}

      {state.formError ? (
        <div className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {state.formError}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending || !activeDecision}
        className="rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Enviando respuesta..." : "Enviar respuesta"}
      </button>
    </form>
  );
}
