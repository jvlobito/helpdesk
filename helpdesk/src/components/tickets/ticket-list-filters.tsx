import { ticketCategories, ticketPriorities, ticketStatuses } from "@/lib/helpdesk";

type TicketListFiltersProps = {
  basePath: string;
  filters: {
    assignedToId?: string;
    category?: string;
    createdFrom?: string;
    createdTo?: string;
    departmentId?: string;
    priority?: string;
    q?: string;
    status?: string;
  };
  assignedToOptions?: Array<{ id: string; label: string }>;
  departmentOptions?: Array<{ id: string; label: string }>;
};

export function TicketListFilters({ assignedToOptions = [], basePath, departmentOptions = [], filters }: TicketListFiltersProps) {
  return (
    <form action={basePath} className="grid gap-3 md:grid-cols-4 xl:grid-cols-6">
      <input
        name="q"
        defaultValue={filters.q ?? ""}
        placeholder="Buscar por numero, titulo o descripcion"
        className="rounded-xl border border-white/10 bg-card px-4 py-3 text-sm md:col-span-2 xl:col-span-2"
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

      {departmentOptions.length > 0 ? (
        <select name="departmentId" defaultValue={filters.departmentId ?? ""} className="rounded-xl border border-white/10 bg-card px-4 py-3 text-sm md:col-span-2 xl:col-span-2">
          <option value="">Todos los departamentos</option>
          {departmentOptions.map((department) => (
            <option key={department.id} value={department.id}>
              {department.label}
            </option>
          ))}
        </select>
      ) : null}

      {assignedToOptions.length > 0 ? (
        <select name="assignedToId" defaultValue={filters.assignedToId ?? ""} className="rounded-xl border border-white/10 bg-card px-4 py-3 text-sm md:col-span-2 xl:col-span-2">
          <option value="">Todos los agentes asignados</option>
          {assignedToOptions.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.label}
            </option>
          ))}
        </select>
      ) : null}

      <input
        type="date"
        name="createdFrom"
        defaultValue={filters.createdFrom ?? ""}
        className="rounded-xl border border-white/10 bg-card px-4 py-3 text-sm"
      />

      <input
        type="date"
        name="createdTo"
        defaultValue={filters.createdTo ?? ""}
        className="rounded-xl border border-white/10 bg-card px-4 py-3 text-sm"
      />

      <div className="flex flex-col gap-3 sm:flex-row md:col-span-2 xl:col-span-2">
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
