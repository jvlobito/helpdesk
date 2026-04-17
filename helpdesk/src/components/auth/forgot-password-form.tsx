"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.email("Ingresa un email valido."),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<ForgotPasswordFormValues>({
    defaultValues: {
      email: "",
    },
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = handleSubmit((values) => {
    setServerError(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const response = await fetch("/api/auth/forgot-password", {
        body: JSON.stringify(values),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const payload = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        setServerError(payload?.message ?? "No fue posible solicitar la recuperacion.");
        return;
      }

      setSuccessMessage(payload?.message ?? "Solicitud enviada.");
    });
  });

  return (
    <form className="mt-8 space-y-4" onSubmit={onSubmit}>
      <label className="block space-y-2 text-sm text-slate-300">
        <span>Email</span>
        <input
          type="email"
          autoComplete="email"
          placeholder="cliente@empresa.com"
          className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3"
          {...register("email")}
        />
        {errors.email ? <p className="text-xs text-rose-300">{errors.email.message}</p> : null}
      </label>

      <div className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
        Si el correo existe, PocketBase procesara la solicitud de recuperacion con su flujo configurado.
      </div>

      {serverError ? (
        <div className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {serverError}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
          {successMessage}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Solicitando..." : "Solicitar recuperacion"}
      </button>

      <p className="text-center text-sm text-slate-400">
        <Link href="/login" className="text-emerald-300 hover:text-emerald-200">
          Volver a iniciar sesion
        </Link>
      </p>
    </form>
  );
}
