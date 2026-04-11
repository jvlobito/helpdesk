import { LoginForm } from "@/components/auth/login-form";
import { redirectAuthenticatedUser } from "@/lib/auth-server";

export default async function LoginPage() {
  await redirectAuthenticatedUser();

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 items-center px-6 py-12">
      <section className="w-full rounded-3xl border border-white/10 bg-card p-8 shadow-2xl shadow-black/20">
        <p className="text-sm font-medium text-emerald-300">Acceso protegido</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Iniciar sesion</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Inicia sesion contra PocketBase y redirige al espacio correspondiente segun rol.
        </p>

        <LoginForm />
      </section>
    </main>
  );
}
