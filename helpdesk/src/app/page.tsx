import Link from "next/link";

import { RouteCard } from "@/components/route-card";
import { landingRoutes, productHighlights, stackSummary } from "@/lib/helpdesk";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-12 px-6 py-10 lg:px-10">
      <section className="grid gap-8 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-6">
          <div className="inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-200">
            Generado desde `requerimientos.md`
          </div>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              HelpDesk MVP listo para evolucionar a autenticacion, tickets y dashboard.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Este starter aterriza el PRD consolidado en un proyecto Next.js con App Router,
              rutas principales del MVP, helper para PocketBase y una guia de implementacion por fases.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/app"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
            >
              Abrir workspace
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/5"
            >
              Ver registro cliente
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
            Stack base
          </p>
          <ul className="mt-4 space-y-3 text-sm text-slate-200">
            {stackSummary.map((item) => (
              <li key={item.name} className="flex items-start justify-between gap-4 border-b border-white/5 pb-3">
                <span className="text-slate-400">{item.name}</span>
                <span className="text-right font-medium text-white">{item.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {productHighlights.map((highlight) => (
          <article key={highlight.title} className="rounded-2xl border border-white/10 bg-card p-6">
            <p className="text-sm font-medium text-emerald-300">{highlight.kicker}</p>
            <h2 className="mt-2 text-xl font-semibold text-white">{highlight.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">{highlight.description}</p>
          </article>
        ))}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">Rutas sembradas</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Las siguientes vistas ya existen como base navegable del MVP para cliente, agente y supervisor.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {landingRoutes.map((route) => (
            <RouteCard key={route.href} {...route} />
          ))}
        </div>
      </section>
    </main>
  );
}
