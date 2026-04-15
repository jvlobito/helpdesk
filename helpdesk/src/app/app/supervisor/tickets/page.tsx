import Link from "next/link";

import { TicketListFilters } from "@/components/tickets/ticket-list-filters";
import { TicketPagination } from "@/components/tickets/ticket-pagination";
import { requireRoleSession } from "@/lib/auth-server";
import { listDepartments, listInternalUsers, listSupervisorTickets } from "@/lib/helpdesk-server";

type SupervisorTicketsPageProps = {
  searchParams: Promise<{
    assignedToId?: string;
    category?: string;
    createdFrom?: string;
    createdTo?: string;
    departmentId?: string;
    page?: string;
    priority?: string;
    q?: string;
    status?: string;
  }>;
};

export default async function SupervisorTicketsPage({ searchParams }: SupervisorTicketsPageProps) {
  await requireRoleSession("supervisor");
  const filters = await searchParams;
  const [departments, internalUsers, tickets] = await Promise.all([
    listDepartments(),
    listInternalUsers(),
    listSupervisorTickets({
      assignedToId: filters.assignedToId,
      category: filters.category,
      createdFrom: filters.createdFrom,
      createdTo: filters.createdTo,
      departmentId: filters.departmentId,
      page: filters.page ? Number.parseInt(filters.page, 10) : 1,
      priority: filters.priority,
      q: filters.q,
      status: filters.status,
    }),
  ]);
  const departmentOptions = departments.map((department) => ({ id: department.id, label: department.name }));
  const assignedToOptions = internalUsers
    .filter((user) => user.role === "agente")
    .map((user) => ({ id: user.id, label: `${user.name} (${user.email})` }));

  return (
    <main className="space-y-6">
      <div>
        <p className="text-sm font-medium text-emerald-300">RF-03</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Vista global de tickets</h2>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Vista global de tickets para supervision operativa del MVP actual.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link
            href={{
              pathname: "/app/supervisor/exports/tickets",
              query: {
                ...(filters.assignedToId ? { assignedToId: filters.assignedToId } : {}),
                ...(filters.category ? { category: filters.category } : {}),
                ...(filters.createdFrom ? { createdFrom: filters.createdFrom } : {}),
                ...(filters.createdTo ? { createdTo: filters.createdTo } : {}),
                ...(filters.departmentId ? { departmentId: filters.departmentId } : {}),
                ...(filters.priority ? { priority: filters.priority } : {}),
                ...(filters.q ? { q: filters.q } : {}),
                ...(filters.status ? { status: filters.status } : {}),
              },
            }}
            className="rounded-xl border border-white/10 px-4 py-2 text-slate-100 transition hover:bg-white/5"
          >
            Exportar CSV filtrado
          </Link>
        </div>
      </div>

      <TicketListFilters
        assignedToOptions={assignedToOptions}
        basePath="/app/supervisor/tickets"
        departmentOptions={departmentOptions}
        filters={filters}
      />

      <p className="text-xs text-slate-500 sm:hidden">Desliza horizontalmente la tabla si necesitas ver todas las columnas.</p>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-card">
        <div className="overflow-x-auto">
        <table className="min-w-[760px] w-full text-left text-sm">
          <thead className="bg-white/5 text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Numero</th>
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Prioridad</th>
              <th className="px-4 py-3 font-medium">Departamento</th>
              <th className="px-4 py-3 font-medium">Detalle</th>
            </tr>
          </thead>
          <tbody>
            {tickets.items.length === 0 ? (
              <tr className="border-t border-white/5 text-slate-300">
                <td colSpan={6} className="px-4 py-8 text-center">
                  No hay tickets que coincidan con los filtros actuales.
                </td>
              </tr>
            ) : null}
            {tickets.items.map((ticket) => (
              <tr key={ticket.id} className="border-t border-white/5 text-slate-200">
                <td className="px-4 py-3">{ticket.ticketNumber}</td>
                <td className="px-4 py-3">{ticket.createdBy}</td>
                <td className="px-4 py-3">{ticket.status}</td>
                <td className="px-4 py-3">{ticket.priority}</td>
                <td className="px-4 py-3">{ticket.departmentName}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/app/supervisor/tickets/${ticket.id}`}
                    className="text-emerald-300 hover:text-emerald-200"
                  >
                    Abrir
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </section>

      <TicketPagination
        basePath="/app/supervisor/tickets"
        filters={filters}
        page={tickets.page}
        totalItems={tickets.totalItems}
        totalPages={tickets.totalPages}
      />
    </main>
  );
}
