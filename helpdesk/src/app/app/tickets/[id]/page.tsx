import { notFound } from "next/navigation";

import { CustomerResolutionForm } from "@/components/tickets/customer-resolution-form";
import { CommentForm } from "@/components/tickets/comment-form";
import { requireAuthSession } from "@/lib/auth-server";
import { closeReasonLabels, reopenReasonLabels } from "@/lib/helpdesk";
import {
  formatMaybeDate,
  getCommentsForTicket,
  getHistoryForTicket,
  getTicketById,
} from "@/lib/helpdesk-server";

type TicketDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function TicketDetailPage({ params }: TicketDetailPageProps) {
  const { id } = await params;
  const session = await requireAuthSession();
  const ticket = await getTicketById(id);

  if (!ticket || ticket.createdById !== session.user.id) {
    notFound();
  }

  const visibleComments = getCommentsForTicket(ticket.id, false);
  const history = getHistoryForTicket(ticket.id);
  const [visibleCommentsData, historyData] = await Promise.all([visibleComments, history]);

  return (
    <main className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-card p-6">
        <p className="text-sm font-medium text-emerald-300">RF-07 + RF-11</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">{ticket.title}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-400">{ticket.description}</p>

        <dl className="mt-6 grid gap-4 text-sm md:grid-cols-3">
          <div>
            <dt className="text-slate-500">Numero</dt>
            <dd className="mt-1 text-white">{ticket.ticketNumber}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Estado</dt>
            <dd className="mt-1 text-white">{ticket.status}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Prioridad</dt>
            <dd className="mt-1 text-white">{ticket.priority}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Categoria</dt>
            <dd className="mt-1 text-white">{ticket.category}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Departamento</dt>
            <dd className="mt-1 text-white">{ticket.departmentName}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Actualizado</dt>
            <dd className="mt-1 text-white">{formatMaybeDate(ticket.updatedAt)}</dd>
          </div>
        </dl>

        {ticket.attachments.length ? (
          <div className="mt-6">
            <p className="text-sm text-slate-500">Adjuntos</p>
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
          <h3 className="text-xl font-semibold text-white">Comentarios visibles al cliente</h3>
          <p className="mt-2 text-sm text-slate-400">Aqui aparecen comentarios publicos del cliente, agente o supervisor. Los comentarios internos no se muestran en esta vista.</p>
          <div className="mt-4 space-y-4">
            {visibleCommentsData.length === 0 ? (
              <div className="rounded-2xl border border-white/8 bg-slate-950/60 p-4 text-sm text-slate-400">
                Aun no hay comentarios visibles para este ticket.
              </div>
            ) : null}
            {visibleCommentsData.map((comment) => (
              <div key={comment.id} className="rounded-2xl border border-white/8 bg-slate-950/60 p-4">
                <p className="text-sm font-medium text-white">{comment.author}</p>
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
              allowInternal={false}
              role={session.user.role}
              returnPath={`/app/tickets/${ticket.id}`}
              ticketId={ticket.id}
            />
          ) : (
            <div className="mt-6 rounded-2xl border border-white/8 bg-slate-950/60 p-4 text-sm text-slate-400">
              Este ticket esta cerrado. Ya no admite comentarios nuevos.
            </div>
          )}
          {ticket.status === "resolved" ? (
            <CustomerResolutionForm returnPath={`/app/tickets/${ticket.id}`} ticketId={ticket.id} />
          ) : null}
        </article>

        <article className="rounded-3xl border border-white/10 bg-card p-6">
          <h3 className="text-xl font-semibold text-white">Historial</h3>
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
      </section>
    </main>
  );
}
