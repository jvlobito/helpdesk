"use client";

import { useEffect, useRef, useState } from "react";
import { useActionState } from "react";

import { allowedTransitions, type TicketStatus } from "@/lib/helpdesk";

import {
  changeTicketStatusAction,
  reassignTicketAction,
  takeTicketAction,
  type WorkflowFormState,
} from "@/app/app/tickets/[id]/workflow-actions";
import type { AssignableAgentView } from "@/lib/helpdesk-server";

const initialState: WorkflowFormState = {};

type TicketWorkflowFormProps = {
  assignableAgents: AssignableAgentView[];
  allowTake: boolean;
  returnPath: string;
  status: TicketStatus;
  ticketId: string;
};

export function TicketWorkflowForm({ assignableAgents, allowTake, returnPath, status, ticketId }: TicketWorkflowFormProps) {
  const [takeState, takeAction, isTaking] = useActionState(takeTicketAction, initialState);
  const [statusState, statusAction, isChanging] = useActionState(changeTicketStatusAction, initialState);
  const [reassignState, reassignAction, isReassigning] = useActionState(reassignTicketAction, initialState);
  const [selectedNextStatus, setSelectedNextStatus] = useState("");
  const takeFormRef = useRef<HTMLFormElement>(null);
  const statusFormRef = useRef<HTMLFormElement>(null);
  const reassignFormRef = useRef<HTMLFormElement>(null);
  const nextStatuses = allowedTransitions[status].filter((nextStatus) => nextStatus !== "closed" && nextStatus !== "reopened");
  const nextStatusValue = statusState.successMessage ? "" : selectedNextStatus || statusState.values?.nextStatus || "";

  useEffect(() => {
    if (takeState.successMessage) {
      takeFormRef.current?.reset();
    }
  }, [takeState.successMessage]);

  useEffect(() => {
    if (statusState.successMessage) {
      statusFormRef.current?.reset();
    }
  }, [statusState.successMessage]);

  useEffect(() => {
    if (reassignState.successMessage) {
      reassignFormRef.current?.reset();
    }
  }, [reassignState.successMessage]);

  return (
    <div className="space-y-4 rounded-3xl border border-white/10 bg-card p-6">
      <h3 className="text-xl font-semibold text-white">Acciones del ticket</h3>

      {allowTake ? (
        <form ref={takeFormRef} action={takeAction} className="space-y-3 rounded-2xl border border-white/8 bg-slate-950/60 p-4">
          <input type="hidden" name="ticketId" value={ticketId} />
          <input type="hidden" name="returnPath" value={returnPath} />
          <p className="text-sm text-slate-300">Tomar este ticket lo asigna al usuario actual y lo pasa a `in_progress`.</p>
          {takeState.successMessage ? (
            <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
              {takeState.successMessage}
            </div>
          ) : null}
          {takeState.formError ? (
            <div className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              {takeState.formError}
            </div>
          ) : null}
          <button
            type="submit"
            disabled={isTaking}
            className="rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isTaking ? "Tomando ticket..." : "Tomar ticket"}
          </button>
        </form>
      ) : null}

      <form ref={statusFormRef} action={statusAction} className="space-y-3 rounded-2xl border border-white/8 bg-slate-950/60 p-4">
        <input type="hidden" name="ticketId" value={ticketId} />
        <input type="hidden" name="returnPath" value={returnPath} />
        <label className="block space-y-2 text-sm text-slate-300">
          <span>Cambiar estado</span>
          <select
            name="nextStatus"
            value={nextStatusValue}
            onChange={(event) => setSelectedNextStatus(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 capitalize"
          >
            <option value="" disabled>
              Selecciona un estado destino
            </option>
            {nextStatuses.map((nextStatus) => (
              <option key={nextStatus} value={nextStatus}>
                {nextStatus}
              </option>
            ))}
          </select>
        </label>
        {status === "resolved" ? (
          <p className="text-sm text-slate-400">Cuando un ticket queda en `resolved`, el siguiente paso normal es esperar confirmacion del cliente o una solicitud de reapertura.</p>
        ) : null}
        {nextStatusValue === "resolved" ? (
          <div className="space-y-3 rounded-2xl border border-white/8 bg-slate-900/60 p-4">
            <p className="text-sm font-medium text-white">Datos requeridos para resolver</p>
            <label className="block space-y-2 text-sm text-slate-300">
              <span>Nota de resolucion</span>
              <textarea
                name="resolutionNote"
                rows={3}
                defaultValue={statusState.values?.resolutionNote ?? ""}
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3"
              />
            </label>
          </div>
        ) : null}
        {statusState.successMessage ? (
          <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
            {statusState.successMessage}
          </div>
        ) : null}
        {nextStatuses.length === 0 ? (
          <p className="text-sm text-slate-400">Este ticket no tiene transiciones validas desde el estado actual.</p>
        ) : null}
        {statusState.formError ? (
          <div className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {statusState.formError}
          </div>
        ) : null}
        <button
          type="submit"
          disabled={isChanging || nextStatuses.length === 0}
          className="rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isChanging ? "Actualizando estado..." : "Actualizar estado"}
        </button>
      </form>

      <form ref={reassignFormRef} action={reassignAction} className="space-y-3 rounded-2xl border border-white/8 bg-slate-950/60 p-4">
        <input type="hidden" name="ticketId" value={ticketId} />
        <input type="hidden" name="returnPath" value={returnPath} />
        <label className="block space-y-2 text-sm text-slate-300">
          <span>Reasignar ticket</span>
          <select
            name="assigneeId"
            defaultValue={reassignState.values?.assigneeId ?? ""}
            disabled={assignableAgents.length === 0}
            className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3"
          >
            <option value="" disabled>
              Selecciona un agente del mismo departamento
            </option>
            {assignableAgents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name} · {agent.email}
              </option>
            ))}
          </select>
        </label>
        {assignableAgents.length === 0 ? (
          <p className="text-sm text-slate-400">No hay agentes disponibles en este departamento para reasignar.</p>
        ) : null}
        {reassignState.successMessage ? (
          <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
            {reassignState.successMessage}
          </div>
        ) : null}
        {reassignState.formError ? (
          <div className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {reassignState.formError}
          </div>
        ) : null}
        <button
          type="submit"
          disabled={isReassigning || assignableAgents.length === 0}
          className="rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isReassigning ? "Reasignando..." : "Reasignar"}
        </button>
      </form>
    </div>
  );
}
