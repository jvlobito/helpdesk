import Link from "next/link";

import { TicketListFilters } from "@/components/tickets/ticket-list-filters";
import { TicketPagination } from "@/components/tickets/ticket-pagination";
import { requireAuthSession } from "@/lib/auth-server";
import { formatMaybeDate, listCustomerTickets } from "@/lib/helpdesk-server";

type CustomerTicketsPageProps = {
  searchParams: Promise<{
    category?: string;
    created?: string;
    page?: string;
    priority?: string;
    q?: string;
    status?: string;
  }>;
};

export default async function CustomerTicketsPage({ searchParams }: CustomerTicketsPageProps) {
  const session = await requireAuthSession();
  const filters = await searchParams;
  const customerTickets = await listCustomerTickets(session.user.id, {
    category: filters.category,
    page: filters.page ? Number.parseInt(filters.page, 10) : 1,
    priority: filters.priority,
    q: filters.q,
    status: filters.status,
  });

  return (
    <main className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-300">RF-06 + RF-12</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Mis tickets</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Vista protegida del cliente autenticado con tickets reales y seguimiento basico del caso.
          </p>
        </div>

        <Link
          href="/app/tickets/new"
          className="inline-flex items-center justify-center rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950"
        >
          Crear ticket
        </Link>
      </div>

      <TicketListFilters basePath="/app/tickets" filters={filters} />

      <p className="text-xs text-slate-500 sm:hidden">Desliza horizontalmente la tabla si necesitas ver todas las columnas.</p>

      {filters.created === "1" ? (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
          El ticket se creo correctamente.
        </div>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-card">
        <div className="overflow-x-auto">
        <table className="min-w-[720px] w-full text-left text-sm">
          <thead className="bg-white/5 text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Numero</th>
              <th className="px-4 py-3 font-medium">Titulo</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Prioridad</th>
              <th className="px-4 py-3 font-medium">Departamento</th>
              <th className="px-4 py-3 font-medium">Actualizado</th>
            </tr>
          </thead>
          <tbody>
            {customerTickets.items.length === 0 ? (
              <tr className="border-t border-white/5 text-slate-300">
                <td colSpan={6} className="px-4 py-8 text-center">
                  No hubo resultados para los filtros actuales o aun no tienes tickets creados.
                </td>
              </tr>
            ) : null}
            {customerTickets.items.map((ticket) => (
              <tr key={ticket.id} className="border-t border-white/5 text-slate-200">
                <td className="px-4 py-3">
                  <Link href={`/app/tickets/${ticket.id}`} className="text-emerald-300 hover:text-emerald-200">
                    {ticket.ticketNumber}
                  </Link>
                </td>
                <td className="px-4 py-3">{ticket.title}</td>
                <td className="px-4 py-3">{ticket.status}</td>
                <td className="px-4 py-3">{ticket.priority}</td>
                <td className="px-4 py-3">{ticket.departmentName}</td>
                <td className="px-4 py-3">{formatMaybeDate(ticket.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </section>

      <TicketPagination
        basePath="/app/tickets"
        filters={filters}
        page={customerTickets.page}
        totalItems={customerTickets.totalItems}
        totalPages={customerTickets.totalPages}
      />
    </main>
  );
}
