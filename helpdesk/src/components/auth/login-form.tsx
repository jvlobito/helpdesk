"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const loginSchema = z.object({
  email: z.email("Ingresa un email valido."),
  password: z.string().min(8, "La password debe tener al menos 8 caracteres."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = handleSubmit((values) => {
    setServerError(null);

    startTransition(async () => {
      const response = await fetch("/api/auth/login", {
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
        setServerError(payload?.message ?? "No fue posible iniciar sesion.");
        return;
      }

      router.replace(payload?.redirectTo ?? "/app");
      router.refresh();
    });
  });

  return (
    <form className="mt-8 space-y-4" onSubmit={onSubmit}>
      <label className="block space-y-2 text-sm text-slate-300">
        <span>Email</span>
        <input
          type="email"
          placeholder="cliente@empresa.com"
          autoComplete="email"
          className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3"
          {...register("email")}
        />
        {errors.email ? <p className="text-xs text-rose-300">{errors.email.message}</p> : null}
      </label>

      <label className="block space-y-2 text-sm text-slate-300">
        <span>Password</span>
        <input
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3"
          {...register("password")}
        />
        {errors.password ? <p className="text-xs text-rose-300">{errors.password.message}</p> : null}
      </label>

      {serverError ? (
        <div className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {serverError}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Ingresando..." : "Continuar"}
      </button>
    </form>
  );
}
