import type { UserRole } from "@/lib/helpdesk";
import { createPocketBase, POCKETBASE_AUTH_COOKIE } from "@/lib/pocketbase";

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  active: boolean;
  departmentId?: string;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};

type RawAuthRecord = {
  active?: boolean;
  department_id?: string | null;
  email?: string;
  first_name?: string;
  id?: string;
  last_name?: string;
  role?: string;
};

export function isUserRole(value: unknown): value is UserRole {
  return value === "cliente" || value === "agente" || value === "supervisor";
}

export function getDefaultAppRoute(role: UserRole) {
  switch (role) {
    case "agente":
      return "/app/agent/tickets";
    case "supervisor":
      return "/app/supervisor/dashboard";
    case "cliente":
    default:
      return "/app/tickets";
  }
}

export function getTicketRouteForRole(role: UserRole, ticketId: string) {
  switch (role) {
    case "agente":
      return `/app/agent/tickets/${ticketId}`;
    case "supervisor":
      return `/app/supervisor/tickets/${ticketId}`;
    case "cliente":
    default:
      return `/app/tickets/${ticketId}`;
  }
}

export function getNavigationItems(role: UserRole) {
  const shared = [{ href: getDefaultAppRoute(role), label: "Inicio" }];

  if (role === "cliente") {
    return [
      ...shared,
      { href: "/app/tickets", label: "Mis tickets" },
      { href: "/app/tickets/new", label: "Nuevo ticket" },
    ];
  }

  if (role === "agente") {
    return [...shared, { href: "/app/agent/tickets", label: "Cola agente" }];
  }

  return [
    ...shared,
    { href: "/app/agent/tickets", label: "Vista agente" },
    { href: "/app/supervisor/dashboard", label: "Dashboard" },
    { href: "/app/supervisor/tickets", label: "Tickets" },
    { href: "/app/supervisor/departments", label: "Departamentos" },
    { href: "/app/supervisor/users", label: "Usuarios" },
  ];
}

export function canAccessPath(pathname: string, role: UserRole) {
  if (pathname.startsWith("/app/supervisor")) {
    return role === "supervisor";
  }

  if (pathname.startsWith("/app/agent")) {
    return role === "agente" || role === "supervisor";
  }

  if (pathname.startsWith("/app/tickets")) {
    return role === "cliente";
  }

  return pathname.startsWith("/app");
}

export function getUserDisplayName(user: AuthUser) {
  const fullName = `${user.firstName} ${user.lastName}`.trim();
  return fullName || user.email;
}

function mapAuthRecord(record: RawAuthRecord | null | undefined): AuthUser | null {
  if (!record?.id || !record.email || !isUserRole(record.role)) {
    return null;
  }

  return {
    id: record.id,
    email: record.email,
    firstName: record.first_name ?? "",
    lastName: record.last_name ?? "",
    role: record.role,
    active: record.active !== false,
    departmentId: record.department_id ?? undefined,
  };
}

export function readSessionFromCookieString(cookieHeader?: string | null): AuthSession | null {
  const client = createPocketBase();
  client.authStore.loadFromCookie(cookieHeader ?? "", POCKETBASE_AUTH_COOKIE);

  if (!client.authStore.isValid) {
    return null;
  }

  const user = mapAuthRecord(client.authStore.record as RawAuthRecord | null);

  if (!user || !user.active) {
    return null;
  }

  return {
    token: client.authStore.token,
    user,
  };
}
