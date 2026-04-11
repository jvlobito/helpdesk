import "server-only";

import { cookies } from "next/headers";
import type { RecordModel } from "pocketbase";

import { type AuthSession } from "@/lib/auth";
import { getUserDisplayName } from "@/lib/auth";
import type { CloseReason, ReopenReason, TicketCategory, TicketPriority, TicketStatus, UserRole } from "@/lib/helpdesk";
import { createPocketBase, POCKETBASE_AUTH_COOKIE } from "@/lib/pocketbase";

type AttachmentView = {
  fileName: string;
  url: string;
};

type ExpandedRecord = RecordModel & {
  expand?: Record<string, RecordModel | null | undefined>;
};

export type DepartmentView = {
  active: boolean;
  contactEmail: string;
  description: string;
  id: string;
  name: string;
  openTicketCount?: number;
  ticketCount?: number;
};

export type AssignableAgentView = {
  departmentId?: string;
  email: string;
  id: string;
  name: string;
  role: UserRole;
};

export type TicketView = {
  attachments: AttachmentView[];
  assignedTo?: string;
  assignedToId?: string;
  category: TicketCategory;
  closeReason?: CloseReason;
  closeReasonDetail?: string;
  createdAt: string;
  createdBy: string;
  createdById: string;
  departmentId: string;
  departmentName: string;
  description: string;
  id: string;
  priority: TicketPriority;
  resolvedAt?: string;
  reopenReason?: ReopenReason;
  reopenReasonDetail?: string;
  resolutionNote?: string;
  status: TicketStatus;
  ticketNumber: string;
  title: string;
  updatedAt: string;
};

export type TicketCommentView = {
  attachments: AttachmentView[];
  author: string;
  content: string;
  createdAt: string;
  id: string;
  isInternal: boolean;
};

export type TicketHistoryView = {
  changedAt: string;
  changedBy: string;
  fieldChanged: "status" | "priority" | "assigned_to";
  id: string;
  newValue: string;
  oldValue: string;
};

export type TicketListFilters = {
  category?: string;
  page?: number;
  priority?: string;
  q?: string;
  status?: string;
};

export type TicketListResult = {
  items: TicketView[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type AgentWorkloadView = {
  assignedCount: number;
  departmentName: string;
  email: string;
  id: string;
  name: string;
  openCount: number;
  resolvedCount: number;
};

export type NotificationView = {
  href: string;
  id: string;
  message: string;
  read: boolean;
  title: string;
};

export type InternalUserView = {
  active: boolean;
  departmentId?: string;
  departmentName?: string;
  email: string;
  id: string;
  name: string;
  role: UserRole;
};

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asBoolean(value: unknown) {
  return value === true;
}

function formatMaybeDate(value: string) {
  if (!value) {
    return "Sin actividad registrada";
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? "Sin actividad registrada" : new Date(parsed).toLocaleString("es-MX");
}

function escapeFilterValue(value: string) {
  return value.replaceAll('"', '\\"');
}

function buildTicketFilter(filters: TicketListFilters) {
  const conditions: string[] = [];

  if (filters.status) {
    conditions.push(`status = "${escapeFilterValue(filters.status)}"`);
  }

  if (filters.priority) {
    conditions.push(`priority = "${escapeFilterValue(filters.priority)}"`);
  }

  if (filters.category) {
    conditions.push(`category = "${escapeFilterValue(filters.category)}"`);
  }

  if (filters.q) {
    const safeQuery = escapeFilterValue(filters.q.trim());
    conditions.push(`(title ~ "${safeQuery}" || description ~ "${safeQuery}" || ticket_number ~ "${safeQuery}")`);
  }

  return conditions.join(" && ");
}

function getNormalizedPage(page?: number) {
  return !page || Number.isNaN(page) || page < 1 ? 1 : page;
}

function paginateTickets(items: TicketView[], page = 1, pageSize = 10): TicketListResult {
  const normalizedPage = getNormalizedPage(page);
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(normalizedPage, totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    pageSize,
    totalItems,
    totalPages,
  };
}

function getExpandedRecord(expanded: Record<string, RecordModel | null | undefined> | undefined, key: string) {
  const value = expanded?.[key];
  return value && !Array.isArray(value) ? value : null;
}

async function getServerPocketBase() {
  const cookieStore = await cookies();
  const client = createPocketBase();
  client.authStore.loadFromCookie(cookieStore.toString(), POCKETBASE_AUTH_COOKIE);
  return client;
}

function mapDepartment(record: RecordModel): DepartmentView {
  return {
    active: asBoolean(record.active),
    contactEmail: asString(record.contact_email),
    description: asString(record.description),
    id: record.id,
    name: asString(record.name),
  };
}

function mapTicket(record: ExpandedRecord): TicketView {
  const pb = createPocketBase();
  const department = getExpandedRecord(record.expand, "department_id");
  const createdBy = getExpandedRecord(record.expand, "created_by");
  const assignedTo = getExpandedRecord(record.expand, "assigned_to");

  return {
    attachments: Array.isArray(record.attachments)
      ? record.attachments
          .filter((value) => typeof value === "string" && value)
          .map((fileName) => ({
            fileName,
            url: pb.files.getURL(record, fileName),
          }))
      : [],
    assignedTo: assignedTo ? asString(assignedTo.email) : undefined,
    assignedToId: asString(record.assigned_to) || undefined,
    category: asString(record.category) as TicketCategory,
    closeReason: (asString(record.close_reason) || undefined) as CloseReason | undefined,
    closeReasonDetail: asString(record.close_reason_detail) || undefined,
    createdAt: asString(record.created_at) || asString(record.created),
    createdBy: createdBy ? asString(createdBy.email) : asString(record.created_by),
    createdById: asString(record.created_by),
    departmentId: asString(record.department_id),
    departmentName: department ? asString(department.name) : "Sin departamento",
    description: asString(record.description),
    id: record.id,
    priority: asString(record.priority) as TicketPriority,
    resolvedAt: asString(record.resolved_at) || undefined,
    reopenReason: (asString(record.reopen_reason) || undefined) as ReopenReason | undefined,
    reopenReasonDetail: asString(record.reopen_reason_detail) || undefined,
    resolutionNote: asString(record.resolution_note) || undefined,
    status: asString(record.status) as TicketStatus,
    ticketNumber: asString(record.ticket_number),
    title: asString(record.title),
    updatedAt: asString(record.updated_at) || asString(record.updated),
  };
}

function mapComment(record: ExpandedRecord): TicketCommentView {
  const pb = createPocketBase();
  const author = getExpandedRecord(record.expand, "author_id");

  return {
    attachments: Array.isArray(record.attachments)
      ? record.attachments
          .filter((value) => typeof value === "string" && value)
          .map((fileName) => ({
            fileName,
            url: pb.files.getURL(record, fileName),
          }))
      : [],
    author: author ? asString(author.email) : asString(record.author_id),
    content: asString(record.content),
    createdAt: asString(record.created_at) || asString(record.created),
    id: record.id,
    isInternal: asBoolean(record.is_internal),
  };
}

function mapNotification(record: ExpandedRecord): NotificationView {
  return {
    href: asString(record.href),
    id: record.id,
    message: asString(record.message),
    read: asBoolean(record.read),
    title: asString(record.title),
  };
}

function mapHistory(record: ExpandedRecord): TicketHistoryView {
  const changedBy = getExpandedRecord(record.expand, "changed_by");

  return {
    changedAt: asString(record.changed_at) || asString(record.created),
    changedBy: changedBy ? asString(changedBy.email) : asString(record.changed_by),
    fieldChanged: (asString(record.field_changed) as TicketHistoryView["fieldChanged"]) || "status",
    id: record.id,
    newValue: asString(record.new_value),
    oldValue: asString(record.old_value),
  };
}

export async function listDepartments() {
  const pb = await getServerPocketBase();
  const records = await pb.collection("departments").getFullList({ sort: "name" });
  return records.map(mapDepartment);
}

export async function listActiveDepartments() {
  const pb = await getServerPocketBase();
  const records = await pb.collection("departments").getFullList({
    filter: "active = true",
    sort: "name",
  });

  return records.map(mapDepartment);
}

export async function listCustomerTickets(userId: string, filters: TicketListFilters = {}) {
  const pb = await getServerPocketBase();
  const extraFilter = buildTicketFilter(filters);
  const records = await pb.collection("tickets").getFullList({
    expand: "department_id,created_by,assigned_to",
    filter: extraFilter ? `created_by = "${userId}" && ${extraFilter}` : `created_by = "${userId}"`,
    sort: "-updated_at",
  });

  return paginateTickets(records.map((record) => mapTicket(record as ExpandedRecord)), filters.page);
}

export async function listAgentTickets(session: AuthSession, filters: TicketListFilters = {}) {
  const pb = await getServerPocketBase();
  const roleFilters = [`assigned_to = "${session.user.id}"`];

  if (session.user.departmentId) {
    roleFilters.push(`(department_id = "${session.user.departmentId}" && assigned_to = "")`);
  }

  const extraFilter = buildTicketFilter(filters);
  const roleFilter = `(${roleFilters.join(" || ")})`;

  const records = await pb.collection("tickets").getFullList({
    expand: "department_id,created_by,assigned_to",
    filter: extraFilter ? `${roleFilter} && ${extraFilter}` : roleFilter,
    sort: "-updated_at",
  });

  return paginateTickets(records.map((record) => mapTicket(record as ExpandedRecord)), filters.page);
}

export async function listSupervisorTickets(filters: TicketListFilters = {}) {
  const pb = await getServerPocketBase();
  const extraFilter = buildTicketFilter(filters);
  const records = await pb.collection("tickets").getFullList({
    expand: "department_id,created_by,assigned_to",
    filter: extraFilter,
    sort: "-updated_at",
  });

  return paginateTickets(records.map((record) => mapTicket(record as ExpandedRecord)), filters.page);
}

export async function listAllSupervisorTickets(filters: TicketListFilters = {}) {
  const pb = await getServerPocketBase();
  const extraFilter = buildTicketFilter(filters);
  const records = await pb.collection("tickets").getFullList({
    expand: "department_id,created_by,assigned_to",
    filter: extraFilter,
    sort: "-updated_at",
  });

  return records.map((record) => mapTicket(record as ExpandedRecord));
}

export async function getTicketById(ticketId: string) {
  const pb = await getServerPocketBase();

  try {
    const record = await pb.collection("tickets").getOne(ticketId, {
      expand: "department_id,created_by,assigned_to",
    });

    return mapTicket(record as ExpandedRecord);
  } catch {
    return null;
  }
}

export async function getCommentsForTicket(ticketId: string, includeInternal: boolean) {
  const pb = await getServerPocketBase();
  const filter = includeInternal
    ? `ticket_id = "${ticketId}"`
    : `ticket_id = "${ticketId}" && is_internal = false`;

  const records = await pb.collection("comments").getFullList({
    expand: "author_id",
    filter,
    sort: "created_at",
  });

  return records.map((record) => mapComment(record as ExpandedRecord));
}

export async function getHistoryForTicket(ticketId: string) {
  const pb = await getServerPocketBase();
  const records = await pb.collection("ticket_history").getFullList({
    expand: "changed_by",
    filter: `ticket_id = "${ticketId}"`,
    sort: "changed_at",
  });

  return records.map((record) => mapHistory(record as ExpandedRecord));
}

export async function getDepartmentMap() {
  const departments = await listDepartments();
  return new Map(departments.map((department) => [department.id, department]));
}

export async function listUserNotifications(userId: string, limit = 5) {
  const pb = await getServerPocketBase();
  const records = await pb.collection("notifications").getList(1, limit, {
    filter: `user_id = "${userId}" && read = false`,
    sort: "-created_ts",
  });

  return records.items.map((record) => mapNotification(record as ExpandedRecord));
}

export async function listInternalUsers() {
  const pb = await getServerPocketBase();
  const [users, departments] = await Promise.all([
    pb.collection("users").getFullList({
      filter: 'role != "cliente"',
      sort: "role,first_name,email",
    }),
    listDepartments(),
  ]);
  const departmentMap = new Map(departments.map((department) => [department.id, department.name]));

  return users.map((record) => ({
    active: record.active !== false,
    departmentId: asString(record.department_id) || undefined,
    departmentName: departmentMap.get(asString(record.department_id)) ?? undefined,
    email: asString(record.email),
    id: record.id,
    name:
      getUserDisplayName({
        active: record.active !== false,
        departmentId: asString(record.department_id) || undefined,
        email: asString(record.email),
        firstName: asString(record.first_name),
        id: record.id,
        lastName: asString(record.last_name),
        role: asString(record.role) as UserRole,
      }) || asString(record.email),
    role: asString(record.role) as UserRole,
  })) satisfies InternalUserView[];
}

export async function listAssignableAgents(departmentId: string) {
  const pb = await getServerPocketBase();
  const records = await pb.collection("users").getFullList({
    filter: `role = "agente" && active = true && department_id = "${departmentId}"`,
    sort: "email",
  });

  return records.map((record) => ({
    departmentId: asString(record.department_id) || undefined,
    email: asString(record.email),
    id: record.id,
    name: `${asString(record.first_name)} ${asString(record.last_name)}`.trim() || asString(record.email),
    role: "agente" as UserRole,
  }));
}

export async function getSupervisorDashboardData() {
  const pb = await getServerPocketBase();
  const [departments, ticketItems, agents] = await Promise.all([
    listDepartments(),
    listAllSupervisorTickets(),
    pb.collection("users").getFullList({
      filter: 'role = "agente" && active = true',
      sort: "first_name,email",
    }),
  ]);
  const now = Date.now();
  const agedThreshold = 7 * 24 * 60 * 60 * 1000;
  const departmentMap = new Map(departments.map((department) => [department.id, department.name]));
  const agentWorkload = agents.map((agent) => {
    const assignedTickets = ticketItems.filter((ticket) => ticket.assignedToId === agent.id);

    return {
      assignedCount: assignedTickets.length,
      departmentName: departmentMap.get(asString(agent.department_id)) ?? "Sin departamento",
      email: asString(agent.email),
      id: agent.id,
      name:
        getUserDisplayName({
          active: agent.active !== false,
          departmentId: asString(agent.department_id) || undefined,
          email: asString(agent.email),
          firstName: asString(agent.first_name),
          id: agent.id,
          lastName: asString(agent.last_name),
          role: "agente",
        }) || asString(agent.email),
      openCount: assignedTickets.filter((ticket) => ticket.status !== "closed").length,
      resolvedCount: assignedTickets.filter((ticket) => ticket.status === "resolved" || ticket.status === "closed").length,
    } satisfies AgentWorkloadView;
  });
  const closedTickets = ticketItems.filter((ticket) => ticket.status === "closed");
  const averageResolutionHours =
    closedTickets.length === 0
      ? null
      : Number(
          (
            closedTickets.reduce((sum, ticket) => {
              const createdAt = Date.parse(ticket.createdAt);
              const closedAt = Date.parse(ticket.updatedAt);

              if (Number.isNaN(createdAt) || Number.isNaN(closedAt) || closedAt < createdAt) {
                return sum;
              }

              return sum + (closedAt - createdAt) / (1000 * 60 * 60);
            }, 0) / closedTickets.length
          ).toFixed(1),
        );

  return {
    agentWorkload,
    agedTickets: ticketItems.filter((ticket) => {
      const createdAt = Date.parse(ticket.createdAt);
      return !Number.isNaN(createdAt) && now - createdAt > agedThreshold && ticket.status !== "closed";
    }),
    averageResolutionHours,
    counts: {
      criticalTickets: ticketItems.filter((ticket) => ticket.priority === "critical").length,
      openTickets: ticketItems.filter((ticket) => ticket.status !== "closed").length,
      totalTickets: ticketItems.length,
      unassignedTickets: ticketItems.filter((ticket) => !ticket.assignedToId).length,
    },
    departments,
    tickets: paginateTickets(ticketItems),
  };
}

export async function getDepartmentsWithTicketCounts() {
  const [departments, ticketItems] = await Promise.all([listDepartments(), listAllSupervisorTickets()]);

  return departments.map((department) => ({
    ...department,
    openTicketCount: ticketItems.filter((ticket) => ticket.departmentId === department.id && ticket.status !== "closed").length,
    ticketCount: ticketItems.filter((ticket) => ticket.departmentId === department.id).length,
  }));
}

export { formatMaybeDate };
