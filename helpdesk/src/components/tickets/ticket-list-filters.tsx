import { ticketCategories, ticketPriorities, ticketStatuses } from "@/lib/helpdesk";

type TicketListFiltersProps = {
  basePath: string;
  filters: {
    category?: string;
    priority?: string;
    q?: string;
    status?: string;
  };
};

export function TicketListFilters({ basePath, filters }: TicketListFiltersProps) {
  return (
    <form action={basePath} className="grid gap-3 md:grid-cols-4">
      <input
        name="q"
        defaultValue={filters.q ?? ""}
        placeholder="Buscar por numero, titulo o descripcion"
        className="rounded-xl border border-white/10 bg-card px-4 py-3 text-sm md:col-span-2"
      />

      <select name="status" defaultValue={filters.status ?? ""} className="rounded-xl border border-white/10 bg-card px-4 py-3 text-sm">
        <option value="">Todos los estados</option>
        {ticketStatuses.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>

      <select name="priority" defaultValue={filters.priority ?? ""} className="rounded-xl border border-white/10 bg-card px-4 py-3 text-sm">
        <option value="">Todas las prioridades</option>
        {ticketPriorities.map((priority) => (
          <option key={priority} value={priority}>
            {priority}
          </option>
        ))}
      </select>

      <select name="category" defaultValue={filters.category ?? ""} className="rounded-xl border border-white/10 bg-card px-4 py-3 text-sm md:col-span-2">
        <option value="">Todas las categorias</option>
        {ticketCategories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      <div className="flex flex-col gap-3 sm:flex-row md:col-span-2">
        <button
          type="submit"
          className="rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950"
        >
          Aplicar filtros
        </button>
        <a
          href={basePath}
          className="rounded-xl border border-white/10 px-4 py-3 text-center text-sm font-semibold text-slate-200"
        >
          Limpiar
        </a>
      </div>
    </form>
  );
}
