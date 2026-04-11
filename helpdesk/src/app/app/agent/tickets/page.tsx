import Link from "next/link";

import { TicketListFilters } from "@/components/tickets/ticket-list-filters";
import { TicketPagination } from "@/components/tickets/ticket-pagination";
import { requireAuthSession } from "@/lib/auth-server";
import { listAgentTickets } from "@/lib/helpdesk-server";

type AgentTicketsPageProps = {
  searchParams: Promise<{
    category?: string;
    page?: string;
    priority?: string;
    q?: string;
    status?: string;
  }>;
};

export default async function AgentTicketsPage({ searchParams }: AgentTicketsPageProps) {
  const session = await requireAuthSession();
  const filters = await searchParams;
  const agentView = await listAgentTickets(session, {
    category: filters.category,
    page: filters.page ? Number.parseInt(filters.page, 10) : 1,
    priority: filters.priority,
    q: filters.q,
    status: filters.status,
  });

  return (
    <main className="space-y-6">
      <div>
        <p className="text-sm font-medium text-emerald-300">RF-10</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Cola operativa del agente</h2>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Tickets asignados al agente autenticado y tickets sin asignar del propio departamento.
        </p>
      </div>

      <TicketListFilters basePath="/app/agent/tickets" filters={filters} />

      <p className="text-xs text-slate-500 sm:hidden">Desliza horizontalmente la tabla si necesitas ver todas las columnas.</p>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-card">
        <div className="overflow-x-auto">
        <table className="min-w-[720px] w-full text-left text-sm">
          <thead className="bg-white/5 text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Numero</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Asignado</th>
              <th className="px-4 py-3 font-medium">Departamento</th>
              <th className="px-4 py-3 font-medium">Accion</th>
            </tr>
          </thead>
          <tbody>
            {agentView.items.length === 0 ? (
              <tr className="border-t border-white/5 text-slate-300">
                <td colSpan={5} className="px-4 py-8 text-center">
                  No hay tickets para los filtros actuales ni disponibles en tu cola operativa.
                </td>
              </tr>
            ) : null}
            {agentView.items.map((ticket) => (
              <tr key={ticket.id} className="border-t border-white/5 text-slate-200">
                <td className="px-4 py-3">{ticket.ticketNumber}</td>
                <td className="px-4 py-3">{ticket.status}</td>
                <td className="px-4 py-3">{ticket.assignedTo ?? "Sin asignar"}</td>
                <td className="px-4 py-3">{ticket.departmentName}</td>
                <td className="px-4 py-3">
                  <Link href={`/app/agent/tickets/${ticket.id}`} className="text-emerald-300 hover:text-emerald-200">
                    Ver detalle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </section>

      <TicketPagination
        basePath="/app/agent/tickets"
        filters={filters}
        page={agentView.page}
        totalItems={agentView.totalItems}
        totalPages={agentView.totalPages}
      />
    </main>
  );
}
