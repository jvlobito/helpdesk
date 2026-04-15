import { notFound } from "next/navigation";

import { CommentForm } from "@/components/tickets/comment-form";
import { TicketWorkflowForm } from "@/components/tickets/ticket-workflow-form";
import { requireRoleSession } from "@/lib/auth-server";
import { closeReasonLabels, reopenReasonLabels } from "@/lib/helpdesk";
import {
  formatMaybeDate,
  getCommentsForTicket,
  getHistoryForTicket,
  getTicketById,
  listAssignableAgents,
} from "@/lib/helpdesk-server";

type SupervisorTicketDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function SupervisorTicketDetailPage({ params }: SupervisorTicketDetailPageProps) {
  const { id } = await params;
  const session = await requireRoleSession("supervisor");
  const ticket = await getTicketById(id);

  if (!ticket) {
    notFound();
  }

  const comments = getCommentsForTicket(ticket.id, true);
  const history = getHistoryForTicket(ticket.id);
  const assignableAgents = listAssignableAgents(ticket.departmentId);
  const [commentsData, historyData, agentsData] = await Promise.all([comments, history, assignableAgents]);

  return (
    <main className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-card p-6">
        <p className="text-sm font-medium text-emerald-300">Supervision de detalle</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">{ticket.ticketNumber}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-400">{ticket.title}</p>

        <dl className="mt-6 grid gap-4 text-sm md:grid-cols-4">
          <div>
            <dt className="text-slate-500">Cliente</dt>
            <dd className="mt-1 text-white">{ticket.createdBy}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Asignado</dt>
            <dd className="mt-1 text-white">{ticket.assignedTo ?? "Sin asignar"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Departamento</dt>
            <dd className="mt-1 text-white">{ticket.departmentName}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Ultima actividad</dt>
            <dd className="mt-1 text-white">{formatMaybeDate(ticket.updatedAt)}</dd>
          </div>
        </dl>

        {ticket.attachments.length ? (
          <div className="mt-6">
            <p className="text-sm text-slate-500">Adjuntos del ticket</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-emerald-200">
              {ticket.attachments.map((attachment) => (
                <a key={attachment.url} href={attachment.url} target="_blank" rel="noreferrer" className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1">
                  {attachment.fileName}
                </a>
              ))}
            </div>
          </div>
        ) : null}

        {ticket.closeReason || ticket.resolutionNote || ticket.reopenReason ? (
          <div className="mt-6 space-y-3 rounded-2xl border border-white/8 bg-slate-950/60 p-4 text-sm text-slate-300">
            <p className="font-medium text-white">Seguimiento de cierre</p>
            {ticket.closeReason ? <p>Motivo de cierre: {closeReasonLabels[ticket.closeReason]}</p> : null}
            {ticket.closeReasonDetail ? <p>Detalle de cierre: {ticket.closeReasonDetail}</p> : null}
            {ticket.resolutionNote ? <p>Nota de resolucion: {ticket.resolutionNote}</p> : null}
            {ticket.reopenReason ? <p>Motivo de reapertura: {reopenReasonLabels[ticket.reopenReason]}</p> : null}
            {ticket.reopenReasonDetail ? <p>Detalle de reapertura: {ticket.reopenReasonDetail}</p> : null}
          </div>
        ) : null}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl border border-white/10 bg-card p-6">
          <h3 className="text-xl font-semibold text-white">Comentarios</h3>
          <p className="mt-2 text-sm text-slate-400">Los comentarios publicos tambien son visibles para el cliente. Los comentarios internos quedan reservados para uso operativo.</p>
          <div className="mt-4 space-y-4">
            {commentsData.length === 0 ? (
              <div className="rounded-2xl border border-white/8 bg-slate-950/60 p-4 text-sm text-slate-400">
                Aun no hay comentarios registrados para este ticket.
              </div>
            ) : null}
            {commentsData.map((comment) => (
              <div key={comment.id} className="rounded-2xl border border-white/8 bg-slate-950/60 p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-medium text-white">{comment.author}</p>
                  <span className="text-xs text-slate-500">
                    {comment.isInternal ? "Interno" : "Publico"}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-300">{comment.content}</p>
                {comment.attachments.length ? (
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-emerald-200">
                    {comment.attachments.map((attachment) => (
                      <a key={attachment.url} href={attachment.url} target="_blank" rel="noreferrer" className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1">
                        {attachment.fileName}
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
          {ticket.status !== "closed" ? (
            <CommentForm
              allowInternal
              role={session.user.role}
              returnPath={`/app/supervisor/tickets/${ticket.id}`}
              ticketId={ticket.id}
            />
          ) : (
            <div className="mt-6 rounded-2xl border border-white/8 bg-slate-950/60 p-4 text-sm text-slate-400">
              Este ticket esta cerrado. Ya no admite comentarios nuevos.
            </div>
          )}
        </article>

        <article className="rounded-3xl border border-white/10 bg-card p-6">
          <h3 className="text-xl font-semibold text-white">Historial auditado</h3>
          <div className="mt-4 space-y-4">
            {historyData.length === 0 ? (
              <div className="rounded-2xl border border-white/8 bg-slate-950/60 p-4 text-sm text-slate-400">
                Aun no hay eventos de historial para este ticket.
              </div>
            ) : null}
            {historyData.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-white/8 bg-slate-950/60 p-4">
                <p className="text-sm font-medium text-white">{entry.fieldChanged}</p>
                <p className="mt-2 text-sm text-slate-300">
                  {entry.oldValue} → {entry.newValue}
                </p>
                <p className="mt-2 text-xs text-slate-500">{entry.changedBy}</p>
              </div>
            ))}
          </div>
        </article>

        {ticket.status !== "closed" ? (
          <TicketWorkflowForm
            assignableAgents={agentsData.filter((agent) => agent.id !== ticket.assignedToId)}
            allowTake={!ticket.assignedTo && ticket.status === "new"}
            returnPath={`/app/supervisor/tickets/${ticket.id}`}
            status={ticket.status}
            ticketId={ticket.id}
          />
        ) : (
          <section className="rounded-3xl border border-white/10 bg-card p-6">
            <h3 className="text-xl font-semibold text-white">Acciones del ticket</h3>
            <p className="mt-3 text-sm text-slate-400">El ticket esta en estado final `closed`. Ya no permite reasignacion ni nuevas transiciones.</p>
          </section>
        )}
      </section>
    </main>
  );
}
