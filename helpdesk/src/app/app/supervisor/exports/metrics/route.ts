import { requireAuthSession } from "@/lib/auth-server";
import { getSupervisorDashboardData } from "@/lib/helpdesk-server";
import { getRequestCorrelationId, logOperationalError, logOperationalEvent } from "@/lib/ops";

export async function GET() {
  const session = await requireAuthSession();
  const correlationId = await getRequestCorrelationId();

  if (session.user.role !== "supervisor") {
    return new Response("Forbidden", { status: 403 });
  }

  try {
    const data = await getSupervisorDashboardData();

    logOperationalEvent("supervisor.export.metrics", {
      correlationId,
      supervisorId: session.user.id,
      totalTickets: data.counts.totalTickets,
    });

    return Response.json({
      agentWorkload: data.agentWorkload,
      agedTickets: data.agedTickets.map((ticket) => ({
        departmentName: ticket.departmentName,
        id: ticket.id,
        status: ticket.status,
        ticketNumber: ticket.ticketNumber,
        title: ticket.title,
      })),
      agedTicketsByDepartment: data.agedTicketsByDepartment,
      agedTicketsByStatus: data.agedTicketsByStatus,
      averageResolutionHours: data.averageResolutionHours,
      averageTimeToClosedHours: data.averageTimeToClosedHours,
      averageTimeToResolvedHours: data.averageTimeToResolvedHours,
      counts: data.counts,
      departments: data.departments.map((department) => ({
        active: department.active,
        id: department.id,
        name: department.name,
      })),
      generatedAt: new Date().toISOString(),
      managerialSummary: data.managerialSummary,
      reopenedRatePercent: data.reopenedRatePercent,
    });
  } catch (error) {
    logOperationalError("supervisor.export.metrics.error", error, {
      correlationId,
      supervisorId: session.user.id,
    });
    throw error;
  }
}
