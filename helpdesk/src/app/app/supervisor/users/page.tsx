import { InternalUserForm } from "@/components/users/internal-user-form";
import { listDepartments, listInternalUsers } from "@/lib/helpdesk-server";

export default async function SupervisorUsersPage() {
  const [users, departments] = await Promise.all([listInternalUsers(), listDepartments()]);

  return (
    <main className="space-y-6">
      <div>
        <p className="text-sm font-medium text-emerald-300">Bloque 4.3</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Administracion operativa de usuarios</h2>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Primera iteracion para supervisores: listar usuarios internos y ajustar rol, departamento y estado desde UI.
        </p>
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        {users.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-card p-6 text-sm text-slate-400 lg:col-span-2">
            No hay usuarios internos cargados todavia.
          </div>
        ) : null}
        {users.map((user) => (
          <InternalUserForm key={user.id} departments={departments} user={user} />
        ))}
      </section>
    </main>
  );
}
