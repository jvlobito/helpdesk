export const ticketStatuses = [
  "new",
  "in_progress",
  "waiting",
  "resolved",
  "reopened",
  "closed",
] as const;

export const ticketPriorities = ["low", "medium", "high", "critical"] as const;
export const ticketCategories = ["hardware", "software", "network", "other"] as const;
export const userRoles = ["cliente", "agente", "supervisor"] as const;
export const closeReasons = ["solucion_aplicada", "consulta_resuelta", "sin_respuesta_cliente", "duplicado", "otro"] as const;
export const reopenReasons = ["problema_persistente", "solucion_incompleta", "nuevo_impacto", "otro"] as const;

export type TicketStatus = (typeof ticketStatuses)[number];
export type TicketPriority = (typeof ticketPriorities)[number];
export type TicketCategory = (typeof ticketCategories)[number];
export type UserRole = (typeof userRoles)[number];
export type CloseReason = (typeof closeReasons)[number];
export type ReopenReason = (typeof reopenReasons)[number];

export const closeReasonLabels: Record<CloseReason, string> = {
  solucion_aplicada: "Solucion aplicada",
  consulta_resuelta: "Consulta resuelta",
  sin_respuesta_cliente: "Sin respuesta del cliente",
  duplicado: "Duplicado",
  otro: "Otro",
};

export const reopenReasonLabels: Record<ReopenReason, string> = {
  problema_persistente: "Problema persistente",
  solucion_incompleta: "Solucion incompleta",
  nuevo_impacto: "Nuevo impacto",
  otro: "Otro",
};

export type Department = {
  id: string;
  name: string;
  description: string;
  contactEmail: string;
  active: boolean;
};

export type Ticket = {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  departmentId: string;
  createdBy: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
};

export type TicketComment = {
  id: string;
  ticketId: string;
  author: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
};

export type TicketHistoryEntry = {
  id: string;
  ticketId: string;
  fieldChanged: "status" | "priority" | "assigned_to";
  oldValue: string;
  newValue: string;
  changedBy: string;
  changedAt: string;
};

export const departments: Department[] = [
  {
    id: "dept-it",
    name: "Soporte TI",
    description: "Incidencias de software y estaciones de trabajo.",
    contactEmail: "soporte-ti@techsupport.local",
    active: true,
  },
  {
    id: "dept-network",
    name: "Redes",
    description: "Conectividad, VPN y enlaces internos.",
    contactEmail: "redes@techsupport.local",
    active: true,
  },
  {
    id: "dept-field",
    name: "Mesa de Campo",
    description: "Visitas presenciales y hardware onsite.",
    contactEmail: "campo@techsupport.local",
    active: true,
  },
];

export const tickets: Ticket[] = [
  {
    id: "tkt-1",
    ticketNumber: "TKT-2026-00001",
    title: "No puedo acceder al ERP corporativo",
    description: "El cliente recibe error de autenticacion desde esta manana.",
    status: "in_progress",
    priority: "high",
    category: "software",
    departmentId: "dept-it",
    createdBy: "cliente@acme.com",
    assignedTo: "ana.agente@techsupport.local",
    createdAt: "2026-04-01T08:30:00Z",
    updatedAt: "2026-04-08T10:15:00Z",
  },
  {
    id: "tkt-2",
    ticketNumber: "TKT-2026-00002",
    title: "VPN intermitente para usuarios remotos",
    description: "Los usuarios pierden sesion varias veces al dia.",
    status: "waiting",
    priority: "critical",
    category: "network",
    departmentId: "dept-network",
    createdBy: "cliente@globex.com",
    assignedTo: "luis.redes@techsupport.local",
    createdAt: "2026-03-28T15:00:00Z",
    updatedAt: "2026-04-07T18:40:00Z",
  },
  {
    id: "tkt-3",
    ticketNumber: "TKT-2026-00003",
    title: "Laptop con falla de disco",
    description: "Equipo no inicia y emite ruido de lectura.",
    status: "new",
    priority: "medium",
    category: "hardware",
    departmentId: "dept-field",
    createdBy: "cliente@initech.com",
    createdAt: "2026-04-08T06:20:00Z",
    updatedAt: "2026-04-08T06:20:00Z",
  },
  {
    id: "tkt-4",
    ticketNumber: "TKT-2026-00004",
    title: "Reapertura por error en impresora fiscal",
    description: "El problema reaparecio luego de la visita tecnica.",
    status: "reopened",
    priority: "high",
    category: "hardware",
    departmentId: "dept-field",
    createdBy: "cliente@acme.com",
    assignedTo: "mario.campo@techsupport.local",
    createdAt: "2026-03-30T11:45:00Z",
    updatedAt: "2026-04-08T09:20:00Z",
  },
];

export const comments: TicketComment[] = [
  {
    id: "comment-1",
    ticketId: "tkt-1",
    author: "cliente@acme.com",
    content: "El error aparece al intentar entrar con cualquier usuario.",
    isInternal: false,
    createdAt: "2026-04-01T08:32:00Z",
  },
  {
    id: "comment-2",
    ticketId: "tkt-1",
    author: "ana.agente@techsupport.local",
    content: "Se detecto sincronizacion pendiente con el proveedor de identidad.",
    isInternal: true,
    createdAt: "2026-04-08T09:50:00Z",
  },
  {
    id: "comment-3",
    ticketId: "tkt-2",
    author: "luis.redes@techsupport.local",
    content: "Solicitamos al cliente horarios exactos para correlacionar con los logs.",
    isInternal: false,
    createdAt: "2026-04-07T18:40:00Z",
  },
];

export const historyEntries: TicketHistoryEntry[] = [
  {
    id: "history-1",
    ticketId: "tkt-1",
    fieldChanged: "assigned_to",
    oldValue: "Sin asignar",
    newValue: "ana.agente@techsupport.local",
    changedBy: "supervisor@techsupport.local",
    changedAt: "2026-04-01T08:35:00Z",
  },
  {
    id: "history-2",
    ticketId: "tkt-1",
    fieldChanged: "status",
    oldValue: "new",
    newValue: "in_progress",
    changedBy: "ana.agente@techsupport.local",
    changedAt: "2026-04-01T08:35:00Z",
  },
  {
    id: "history-3",
    ticketId: "tkt-4",
    fieldChanged: "status",
    oldValue: "resolved",
    newValue: "reopened",
    changedBy: "cliente@acme.com",
    changedAt: "2026-04-08T09:20:00Z",
  },
];

export const allowedTransitions: Record<TicketStatus, TicketStatus[]> = {
  new: ["in_progress"],
  in_progress: ["waiting", "resolved"],
  waiting: ["in_progress"],
  resolved: ["reopened", "closed"],
  reopened: ["in_progress"],
  closed: [],
};

export const stackSummary = [
  { name: "Frontend", value: "Next.js 16 + App Router" },
  { name: "Lenguaje", value: "TypeScript" },
  { name: "Estilos", value: "Tailwind CSS 4" },
  { name: "Backend", value: "PocketBase" },
  { name: "Validacion", value: "Zod + React Hook Form" },
  { name: "Graficas", value: "Recharts" },
];

export const productHighlights = [
  {
    kicker: "Cliente",
    title: "Autoservicio inicial",
    description:
      "Registro, login, creacion de tickets, consulta de listado propio, detalle e interaccion por comentarios publicos.",
  },
  {
    kicker: "Operacion",
    title: "Control de flujo y asignacion",
    description:
      "Estados permitidos del MVP, toma de tickets, reasignacion segura y registro de historial para cambios clave.",
  },
  {
    kicker: "Supervision",
    title: "Visibilidad operativa basica",
    description:
      "Dashboard por recarga, conteos por estado, prioridad y departamento, y seguimiento de tickets abiertos por mas de 7 dias.",
  },
];

export const landingRoutes = [
  {
    href: "/login",
    title: "Login",
    description: "Entrada publica para usuarios autenticados por rol.",
  },
  {
    href: "/register",
    title: "Registro cliente",
    description: "Formulario base para alta de clientes con rol por defecto.",
  },
  {
    href: "/app/tickets",
    title: "Mis tickets",
    description: "Listado del cliente con filtros minimos, paginacion y acceso al detalle.",
  },
  {
    href: "/app/tickets/new",
    title: "Nuevo ticket",
    description: "Formulario semilla para creacion de incidencias con departamento y prioridad.",
  },
  {
    href: "/app/agent/tickets",
    title: "Cola de agente",
    description: "Vista de tickets asignados y sin asignar del departamento operativo.",
  },
  {
    href: "/app/supervisor/dashboard",
    title: "Dashboard supervisor",
    description: "Resumen operativo y tickets envejecidos para seguimiento.",
  },
];

export function getDepartmentName(departmentId: string) {
  return departments.find((department) => department.id === departmentId)?.name ?? "Sin departamento";
}

export function getTicketById(ticketId: string) {
  return tickets.find((ticket) => ticket.id === ticketId);
}

export function getCommentsForTicket(ticketId: string, includeInternal: boolean) {
  return comments.filter(
    (comment) => comment.ticketId === ticketId && (includeInternal || !comment.isInternal),
  );
}

export function getHistoryForTicket(ticketId: string) {
  return historyEntries.filter((entry) => entry.ticketId === ticketId);
}

export function getAgedTickets(days = 7) {
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const now = Date.parse("2026-04-08T12:00:00Z");

  return tickets.filter((ticket) => {
    const ageInDays = (now - Date.parse(ticket.createdAt)) / millisecondsPerDay;
    return ageInDays > days && ticket.status !== "closed";
  });
}

export function getDashboardCounts() {
  return {
    totalTickets: tickets.length,
    openTickets: tickets.filter((ticket) => ticket.status !== "closed").length,
    unassignedTickets: tickets.filter((ticket) => !ticket.assignedTo).length,
    criticalTickets: tickets.filter((ticket) => ticket.priority === "critical").length,
  };
}
