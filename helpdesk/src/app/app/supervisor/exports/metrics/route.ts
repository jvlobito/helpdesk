import { requireAuthSession } from "@/lib/auth-server";
import { getSupervisorDashboardData } from "@/lib/helpdesk-server";

export async function GET() {
  const session = await requireAuthSession();

  if (session.user.role !== "supervisor") {
    return new Response("Forbidden", { status: 403 });
  }

  const data = await getSupervisorDashboardData();

  return Response.json({
    agentWorkload: data.agentWorkload,
    agedTickets: data.agedTickets.map((ticket) => ({
      departmentName: ticket.departmentName,
      id: ticket.id,
      status: ticket.status,
      ticketNumber: ticket.ticketNumber,
      title: ticket.title,
    })),
    averageResolutionHours: data.averageResolutionHours,
    counts: data.counts,
    departments: data.departments.map((department) => ({
      active: department.active,
      id: department.id,
      name: department.name,
    })),
    generatedAt: new Date().toISOString(),
  });
}
