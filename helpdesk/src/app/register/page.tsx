import { RegisterForm } from "@/components/auth/register-form";
import { redirectAuthenticatedUser } from "@/lib/auth-server";

export default async function RegisterPage() {
  await redirectAuthenticatedUser();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 items-center px-6 py-12">
      <section className="w-full rounded-3xl border border-white/10 bg-card p-8 shadow-2xl shadow-black/20">
        <p className="text-sm font-medium text-emerald-300">RF-01</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Registro de clientes</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
          Alta publica de clientes usando PocketBase, con `email` unico y rol `cliente` por defecto.
        </p>

        <RegisterForm />
      </section>
    </main>
  );
}
