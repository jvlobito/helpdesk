import { DepartmentForm } from "@/components/departments/department-form";
import { requireRoleSession } from "@/lib/auth-server";
import { getDepartmentsWithTicketCounts } from "@/lib/helpdesk-server";

export default async function SupervisorDepartmentsPage() {
  await requireRoleSession("supervisor");
  const departments = await getDepartmentsWithTicketCounts();

  return (
    <main className="space-y-6">
      <div>
        <p className="text-sm font-medium text-emerald-300">RF-04</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Gestion basica de departamentos</h2>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Gestion basica real de departamentos y carga asociada dentro del MVP actual.
        </p>
      </div>

      <DepartmentForm mode="create" />

      <section className="grid gap-4 lg:grid-cols-2">
        {departments.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-card p-6 text-sm text-slate-400 lg:col-span-2">
            No hay departamentos cargados todavia.
          </div>
        ) : null}
        {departments.map((department) => (
          <div key={department.id} className="space-y-4 rounded-3xl border border-white/10 bg-card p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-white">{department.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{department.description}</p>
              </div>
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                {department.active ? "Activo" : "Inactivo"}
              </span>
            </div>

            <div className="grid gap-3 text-sm text-slate-300 md:grid-cols-2">
              <div>
                <p className="text-slate-500">Contacto</p>
                <p className="mt-1">{department.contactEmail}</p>
              </div>
              <div>
                <p className="text-slate-500">Tickets totales</p>
                <p className="mt-1">{department.ticketCount ?? 0}</p>
              </div>
              <div>
                <p className="text-slate-500">Tickets abiertos</p>
                <p className="mt-1">{department.openTicketCount ?? 0}</p>
              </div>
            </div>

            {!department.active ? (
              <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                Este departamento esta inactivo y ya no debe usarse para tickets nuevos.
              </div>
            ) : null}

            {department.openTicketCount ? (
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
                No se puede marcar como inactivo mientras existan tickets abiertos en este departamento.
              </div>
            ) : null}

            <DepartmentForm department={department} mode="edit" />
          </div>
        ))}
      </section>
    </main>
  );
}
