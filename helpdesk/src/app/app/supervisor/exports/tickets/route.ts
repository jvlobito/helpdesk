import { requireAuthSession } from "@/lib/auth-server";
import { listAllSupervisorTickets } from "@/lib/helpdesk-server";

function escapeCsv(value: string | number | undefined) {
  const normalized = value === undefined ? "" : String(value);
  return `"${normalized.replaceAll('"', '""')}"`;
}

export async function GET() {
  const session = await requireAuthSession();

  if (session.user.role !== "supervisor") {
    return new Response("Forbidden", { status: 403 });
  }

  const tickets = await listAllSupervisorTickets();
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

  return new Response(csv, {
    headers: {
      "Content-Disposition": 'attachment; filename="tickets-export.csv"',
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
