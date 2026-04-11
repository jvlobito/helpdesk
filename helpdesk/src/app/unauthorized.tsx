import Link from "next/link";

export default function Unauthorized() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 items-center px-6 py-12">
      <section className="w-full rounded-3xl border border-white/10 bg-card p-8 text-center shadow-2xl shadow-black/20">
        <p className="text-sm font-medium text-amber-300">Acceso restringido</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">No tienes permisos para esta ruta</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Tu sesion es valida, pero el rol autenticado no puede acceder a esta seccion del MVP.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/app"
            className="rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950"
          >
            Volver al workspace
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-200"
          >
            Cambiar cuenta
          </Link>
        </div>
      </section>
    </main>
  );
}
