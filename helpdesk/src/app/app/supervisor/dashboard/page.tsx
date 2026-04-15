import Link from "next/link";

import { SummaryCard } from "@/components/summary-card";
import { requireRoleSession } from "@/lib/auth-server";
import { getSupervisorDashboardData } from "@/lib/helpdesk-server";
import type { TicketView } from "@/lib/helpdesk-server";

export default async function SupervisorDashboardPage() {
  await requireRoleSession("supervisor");
  const {
    agentWorkload,
    agedTickets,
    agedTicketsByDepartment,
    agedTicketsByStatus,
    averageTimeToClosedHours,
    averageTimeToResolvedHours,
    counts,
    departmentCounts,
    departments,
    managerialSummary,
    priorityCounts,
    reopenedRatePercent,
    statusCounts,
  } = await getSupervisorDashboardData();

  return (
    <main className="space-y-6">
      <div>
        <p className="text-sm font-medium text-emerald-300">RF-13</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Dashboard de supervisor</h2>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Vista de metricas por recarga con datos reales del MVP actual.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link href="/app/supervisor/exports/tickets" className="rounded-xl border border-white/10 px-4 py-2 text-slate-100 transition hover:bg-white/5">
            Exportar tickets CSV
          </Link>
          <Link href="/app/supervisor/exports/metrics" className="rounded-xl border border-white/10 px-4 py-2 text-slate-100 transition hover:bg-white/5">
            Descargar metricas JSON
          </Link>
          <Link href="/app/supervisor/exports/summary" className="rounded-xl border border-white/10 px-4 py-2 text-slate-100 transition hover:bg-white/5">
            Descargar resumen gerencial
          </Link>
        </div>
      </div>

      <section className="rounded-3xl border border-emerald-400/20 bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-emerald-300">Resumen ejecutivo</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Lectura gerencial del periodo</h3>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">{managerialSummary.executiveHeadline}</p>
          </div>
          <p className="text-xs text-slate-500">Generado: {new Date(managerialSummary.generatedAt).toLocaleString("es-MX")}</p>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
          <article className="rounded-2xl border border-white/8 bg-slate-950/60 p-5">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Highlights</h4>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              {managerialSummary.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-white/8 bg-slate-950/60 p-5">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Focos operativos</h4>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              {managerialSummary.operationalFocus.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Tickets totales" value={counts.totalTickets} />
        <SummaryCard label="Tickets abiertos" value={counts.openTickets} />
        <SummaryCard label="Sin asignar" value={counts.unassignedTickets} />
        <SummaryCard label="Criticos" value={counts.criticalTickets} />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          label="Tiempo promedio hasta resolved"
          value={averageTimeToResolvedHours === null ? "N/D" : `${averageTimeToResolvedHours} h`}
          hint="Calculado con tickets que ya alcanzaron estado resolved"
        />
        <SummaryCard
          label="Tiempo promedio hasta closed"
          value={averageTimeToClosedHours === null ? "N/D" : `${averageTimeToClosedHours} h`}
          hint="Calculado con tickets cerrados del dataset actual"
        />
        <SummaryCard
          label="Tasa de reapertura"
          value={`${reopenedRatePercent}%`}
          hint="Porcentaje del dataset actual que hoy esta en reopened"
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
        <SummaryCard
          label="Agentes con carga activa"
          value={agentWorkload.filter((agent) => agent.openCount > 0).length}
          hint="Agentes con al menos un ticket abierto asignado"
        />
        <SummaryCard
          label="Departamentos activos"
          value={departments.filter((department) => department.active).length}
          hint="Departamentos actualmente disponibles para operar"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr_1fr]">
        <article className="rounded-3xl border border-white/10 bg-card p-6">
          <h3 className="text-xl font-semibold text-white">Por estado</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            {statusCounts.map((item) => (
              <li key={item.label} className="flex items-center justify-between">
                <span>{item.label}</span>
                <span>{item.count}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-3xl border border-white/10 bg-card p-6">
          <h3 className="text-xl font-semibold text-white">Por prioridad</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            {priorityCounts.map((item) => (
              <li key={item.label} className="flex items-center justify-between">
                <span>{item.label}</span>
                <span>{item.count}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-3xl border border-white/10 bg-card p-6">
          <h3 className="text-xl font-semibold text-white">Por departamento</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            {departmentCounts.map((item) => (
              <li key={item.label} className="flex items-center justify-between">
                <span>{item.label}</span>
                <span>{item.count}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-3xl border border-white/10 bg-card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-white">Carga por agente</h3>
              <p className="mt-2 text-sm text-slate-400">Tickets asignados, abiertos y resueltos por agente activo.</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {agentWorkload.length === 0 ? (
              <div className="rounded-2xl border border-white/8 bg-slate-950/60 p-4 text-sm text-slate-400">
                No hay agentes activos para mostrar carga operativa.
              </div>
            ) : null}
            {agentWorkload.map((agent) => (
              <div key={agent.id} className="rounded-2xl border border-white/8 bg-slate-950/60 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-white">{agent.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{agent.email}</p>
                    <p className="mt-2 text-xs text-slate-500">{agent.departmentName}</p>
                  </div>
                  <div className="text-right text-sm text-slate-300">
                    <p>Asignados: {agent.assignedCount}</p>
                    <p>Abiertos: {agent.openCount}</p>
                    <p>Resueltos/cerrados: {agent.resolvedCount}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-white/10 bg-card p-6">
          <h3 className="text-xl font-semibold text-white">Alertas operativas</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <div className="rounded-2xl border border-white/8 bg-slate-950/60 p-4">
              <p className="font-medium text-white">Tickets sin asignar</p>
              <p className="mt-2 text-slate-400">
                {counts.unassignedTickets > 0
                  ? `Hay ${counts.unassignedTickets} tickets sin asignar que requieren seguimiento.`
                  : "No hay tickets sin asignar en este momento."}
              </p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-slate-950/60 p-4">
              <p className="font-medium text-white">Tickets envejecidos</p>
              <p className="mt-2 text-slate-400">
                {agedTickets.length > 0
                  ? `Existen ${agedTickets.length} tickets abiertos por mas de 7 dias.`
                  : "No hay tickets envejecidos en este momento."}
              </p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-slate-950/60 p-4">
              <p className="font-medium text-white">Departamentos inactivos</p>
              <p className="mt-2 text-slate-400">
                {departments.some((department) => !department.active)
                  ? `Hay ${departments.filter((department) => !department.active).length} departamentos inactivos registrados.`
                  : "Todos los departamentos estan activos."}
              </p>
            </div>
          </div>
        </article>
      </section>

      <section className="rounded-3xl border border-white/10 bg-card p-6">
        <h3 className="text-xl font-semibold text-white">Tickets abiertos por mas de 7 dias</h3>
        <div className="mt-4 space-y-3">
            {agedTickets.length === 0 ? (
              <div className="rounded-2xl border border-white/8 bg-slate-950/60 p-4 text-sm text-slate-400">
                No hay tickets abiertos con mas de 7 dias en este momento.
              </div>
            ) : null}
            {agedTickets.map((ticket: TicketView) => (
              <div key={ticket.id} className="rounded-2xl border border-white/8 bg-slate-950/60 p-4 text-sm text-slate-300">
                <p className="font-medium text-white">{ticket.ticketNumber}</p>
                <p className="mt-1">{ticket.title}</p>
                <p className="mt-2 text-slate-500">{ticket.departmentName}</p>
              </div>
            ))}
          </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="rounded-3xl border border-white/10 bg-card p-6">
          <h3 className="text-xl font-semibold text-white">Backlog envejecido por estado</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            {agedTicketsByStatus.length === 0 ? (
              <div className="rounded-2xl border border-white/8 bg-slate-950/60 p-4 text-slate-400">
                No hay backlog envejecido para desglosar por estado.
              </div>
            ) : null}
            {agedTicketsByStatus.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl border border-white/8 bg-slate-950/60 p-4">
                <span>{item.label}</span>
                <span>{item.count}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-white/10 bg-card p-6">
          <h3 className="text-xl font-semibold text-white">Backlog envejecido por departamento</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            {agedTicketsByDepartment.length === 0 ? (
              <div className="rounded-2xl border border-white/8 bg-slate-950/60 p-4 text-slate-400">
                No hay backlog envejecido para desglosar por departamento.
              </div>
            ) : null}
            {agedTicketsByDepartment.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl border border-white/8 bg-slate-950/60 p-4">
                <span>{item.label}</span>
                <span>{item.count}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
