import { NewTicketForm } from "@/components/tickets/new-ticket-form";
import { listActiveDepartments } from "@/lib/helpdesk-server";

export default async function NewTicketPage() {
  const departments = await listActiveDepartments();

  return (
    <main className="space-y-6">
      <div>
        <p className="text-sm font-medium text-emerald-300">RF-05</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Crear ticket</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
          Captura `title`, `description`, `priority`, `category` y `department` para persistir el ticket real.
        </p>
      </div>

      {departments.length === 0 ? (
        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          No hay departamentos activos disponibles. Activa al menos un departamento antes de crear tickets.
        </div>
      ) : null}

      <NewTicketForm departments={departments} />
    </main>
  );
}
