"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const registerSchema = z.object({
  email: z.email("Ingresa un email valido."),
  firstName: z.string().trim().min(1, "El nombre es obligatorio."),
  lastName: z.string().trim().min(1, "El apellido es obligatorio."),
  password: z.string().min(8, "La password debe tener al menos 8 caracteres."),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<RegisterFormValues>({
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      password: "",
    },
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = handleSubmit((values) => {
    setServerError(null);

    startTransition(async () => {
      const response = await fetch("/api/auth/register", {
        body: JSON.stringify(values),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const payload = (await response.json().catch(() => null)) as
        | { message?: string; redirectTo?: string }
        | null;

      if (!response.ok) {
        setServerError(payload?.message ?? "No fue posible crear la cuenta.");
        return;
      }

      router.replace(payload?.redirectTo ?? "/app/tickets");
      router.refresh();
    });
  });

  return (
    <form className="mt-8 grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
      <label className="block space-y-2 text-sm text-slate-300">
        <span>Nombre</span>
        <input
          autoComplete="given-name"
          className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3"
          {...register("firstName")}
        />
        {errors.firstName ? <p className="text-xs text-rose-300">{errors.firstName.message}</p> : null}
      </label>

      <label className="block space-y-2 text-sm text-slate-300">
        <span>Apellido</span>
        <input
          autoComplete="family-name"
          className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3"
          {...register("lastName")}
        />
        {errors.lastName ? <p className="text-xs text-rose-300">{errors.lastName.message}</p> : null}
      </label>

      <label className="block space-y-2 text-sm text-slate-300 md:col-span-2">
        <span>Email</span>
        <input
          type="email"
          autoComplete="email"
          className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3"
          {...register("email")}
        />
        {errors.email ? <p className="text-xs text-rose-300">{errors.email.message}</p> : null}
      </label>

      <label className="block space-y-2 text-sm text-slate-300 md:col-span-2">
        <span>Password</span>
        <input
          type="password"
          autoComplete="new-password"
          className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3"
          {...register("password")}
        />
        {errors.password ? <p className="text-xs text-rose-300">{errors.password.message}</p> : null}
      </label>

      <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100 md:col-span-2">
        El rol privilegiado no se expone en la interfaz. La creacion publica solo contempla clientes.
      </div>

      {serverError ? (
        <div className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100 md:col-span-2">
          {serverError}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-70 md:col-span-2"
      >
        {isPending ? "Creando cuenta..." : "Crear cuenta"}
      </button>

      <p className="text-center text-sm text-slate-400 md:col-span-2">
        Ya tienes cuenta?{" "}
        <Link href="/login" className="text-emerald-300 hover:text-emerald-200">
          Inicia sesion aqui
        </Link>
      </p>
    </form>
  );
}
