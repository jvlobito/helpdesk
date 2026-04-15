import { requireAuthSession } from "@/lib/auth-server";
import { listAllSupervisorTickets } from "@/lib/helpdesk-server";
import type { TicketListFilters } from "@/lib/helpdesk-server";
import { getRequestCorrelationId, logOperationalError, logOperationalEvent } from "@/lib/ops";

function escapeCsv(value: string | number | undefined) {
  const normalized = value === undefined ? "" : String(value);
  return `"${normalized.replaceAll('"', '""')}"`;
}

function buildFilename(filters: TicketListFilters) {
  const parts = ["tickets-export"];

  if (filters.status) {
    parts.push(`status-${filters.status}`);
  }

  if (filters.priority) {
    parts.push(`priority-${filters.priority}`);
  }

  if (filters.category) {
    parts.push(`category-${filters.category}`);
  }

  if (filters.departmentId) {
    parts.push("department");
  }

  if (filters.assignedToId) {
    parts.push("assigned");
  }

  if (filters.createdFrom || filters.createdTo) {
    parts.push("date-range");
  }

  if (filters.q) {
    parts.push("search");
  }

  parts.push(new Date().toISOString().slice(0, 10));
  return `${parts.join("-")}.csv`;
}

export async function GET(request: Request) {
  const session = await requireAuthSession();
  const correlationId = await getRequestCorrelationId();

  if (session.user.role !== "supervisor") {
    return new Response("Forbidden", { status: 403 });
  }

  const url = new URL(request.url);
  const filters: TicketListFilters = {
    assignedToId: url.searchParams.get("assignedToId") || undefined,
    category: url.searchParams.get("category") || undefined,
    createdFrom: url.searchParams.get("createdFrom") || undefined,
    createdTo: url.searchParams.get("createdTo") || undefined,
    departmentId: url.searchParams.get("departmentId") || undefined,
    priority: url.searchParams.get("priority") || undefined,
    q: url.searchParams.get("q") || undefined,
    status: url.searchParams.get("status") || undefined,
  };

  try {
    const tickets = await listAllSupervisorTickets(filters);
    const header = [
      "ticket_number",
      "status",
      "priority",
      "category",
      "department",
      "created_by",
      "assigned_to",
      "created_at",
      "updated_at",
      "title",
    ];
    const rows = tickets.map((ticket) => [
      ticket.ticketNumber,
      ticket.status,
      ticket.priority,
      ticket.category,
      ticket.departmentName,
      ticket.createdBy,
      ticket.assignedTo ?? "",
      ticket.createdAt,
      ticket.updatedAt,
      ticket.title,
    ]);
    const csv = [header, ...rows].map((row) => row.map((value) => escapeCsv(value)).join(",")).join("\n");
    const fileName = buildFilename(filters);

    logOperationalEvent("supervisor.export.tickets", {
      correlationId,
      fileName,
      filters,
      rowCount: tickets.length,
      supervisorId: session.user.id,
    });

    return new Response(csv, {
      headers: {
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Type": "text/csv; charset=utf-8",
      },
    });
  } catch (error) {
    logOperationalError("supervisor.export.tickets.error", error, {
      correlationId,
      filters,
      supervisorId: session.user.id,
    });
    throw error;
  }
}
