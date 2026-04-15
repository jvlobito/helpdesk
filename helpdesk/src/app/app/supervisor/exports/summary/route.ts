import { requireAuthSession } from "@/lib/auth-server";
import { getSupervisorDashboardData } from "@/lib/helpdesk-server";
import { getRequestCorrelationId, logOperationalError, logOperationalEvent } from "@/lib/ops";

function buildSummaryContent(data: Awaited<ReturnType<typeof getSupervisorDashboardData>>) {
  const lines = [
    "# Resumen gerencial semanal",
    "",
    `- Generado: ${data.managerialSummary.generatedAt}`,
    `- Tickets totales: ${data.counts.totalTickets}`,
    `- Tickets abiertos: ${data.counts.openTickets}`,
    `- Tickets criticos: ${data.counts.criticalTickets}`,
    `- Tickets sin asignar: ${data.counts.unassignedTickets}`,
    `- Tasa de reapertura: ${data.reopenedRatePercent}%`,
    `- Tiempo promedio hasta resolved: ${data.averageTimeToResolvedHours === null ? "N/D" : `${data.averageTimeToResolvedHours} h`}`,
    `- Tiempo promedio hasta closed: ${data.averageTimeToClosedHours === null ? "N/D" : `${data.averageTimeToClosedHours} h`}`,
    "",
    "## Lectura ejecutiva",
    "",
    data.managerialSummary.executiveHeadline,
    "",
    "## Highlights",
    "",
    ...data.managerialSummary.highlights.map((item) => `- ${item}`),
    "",
    "## Focos operativos",
    "",
    ...data.managerialSummary.operationalFocus.map((item) => `- ${item}`),
  ];

  return `${lines.join("\n")}\n`;
}

export async function GET() {
  const session = await requireAuthSession();
  const correlationId = await getRequestCorrelationId();

  if (session.user.role !== "supervisor") {
    return new Response("Forbidden", { status: 403 });
  }

  try {
    const data = await getSupervisorDashboardData();
    const body = buildSummaryContent(data);
    const fileName = `managerial-summary-${new Date().toISOString().slice(0, 10)}.md`;

    logOperationalEvent("supervisor.export.summary", {
      correlationId,
      fileName,
      supervisorId: session.user.id,
      totalTickets: data.counts.totalTickets,
    });

    return new Response(body, {
      headers: {
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Type": "text/markdown; charset=utf-8",
      },
    });
  } catch (error) {
    logOperationalError("supervisor.export.summary.error", error, {
      correlationId,
      supervisorId: session.user.id,
    });
    throw error;
  }
}
