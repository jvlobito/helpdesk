import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

import PocketBase from "pocketbase";

const projectRoot = process.cwd();
const envFile = path.join(projectRoot, ".env.local");
const appUrl = process.env.QA_APP_URL ?? "http://127.0.0.1:3020";
const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL ?? "http://127.0.0.1:8090";
const reportDir = path.join(projectRoot, "docs", "reports");

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (key && !(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnv(envFile);

const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;

if (!adminEmail || !adminPassword) {
  throw new Error("Faltan POCKETBASE_ADMIN_EMAIL o POCKETBASE_ADMIN_PASSWORD en .env.local.");
}

const users = {
  agente: { email: "ana.agente@techsupport.local", password: "ChangeMe123!" },
  agente2: { email: "diego.soporte@techsupport.local", password: "ChangeMe123!" },
  cliente: { email: "cliente@acme.com", password: "ChangeMe123!" },
  supervisor: { email: "supervisor@techsupport.local", password: "ChangeMe123!" },
};

const results = [];

function nowIso() {
  return new Date().toISOString();
}

function safeTimestamp() {
  return new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
}

function addResult(id, name, status, evidence, details = "") {
  results.push({ details, evidence, id, name, status });
}

function getRoleForResult(id) {
  const byId = {
    "QA-AUTO-01": "Sistema",
    "QA-AUTO-02": "Cliente",
    "QA-AUTO-03": "Agente",
    "QA-AUTO-04": "Supervisor",
    "QA-AUTO-05": "Cliente",
    "QA-AUTO-06": "Agente",
    "QA-AUTO-06A": "Cliente",
    "QA-AUTO-06B": "Cliente",
    "QA-AUTO-06C": "Agente",
    "QA-AUTO-06D": "Supervisor",
    "QA-AUTO-06E": "Agente",
    "QA-AUTO-07": "Supervisor",
    "QA-AUTO-08": "Agente",
    "QA-AUTO-09": "Supervisor",
    "QA-AUTO-10": "Supervisor",
    "QA-AUTO-11": "Supervisor",
    "QA-AUTO-12": "Supervisor",
    "QA-AUTO-13": "Agente",
    "QA-AUTO-14": "Agente",
    "QA-AUTO-15": "Cliente",
    "QA-AUTO-16": "Cliente",
    "QA-AUTO-16A": "Supervisor",
    "QA-AUTO-16B": "Agente",
    "QA-AUTO-17": "Cliente",
    "QA-AUTO-18": "Cliente",
    "QA-AUTO-19": "Cliente",
    "QA-AUTO-20": "Cliente",
    "QA-AUTO-21": "Agente",
    "QA-AUTO-22": "Cliente",
    "QA-AUTO-23": "Agente",
    "QA-AUTO-24": "Sistema",
    "QA-AUTO-25": "Supervisor",
    "QA-AUTO-26": "Supervisor",
    "QA-AUTO-27": "Supervisor",
    "QA-AUTO-28": "Supervisor",
    "QA-AUTO-29": "Supervisor",
    "QA-AUTO-30": "Supervisor",
    "QA-AUTO-31": "Supervisor",
    "QA-AUTO-32": "Supervisor",
    "QA-AUTO-33": "Sistema",
    "QA-AUTO-34": "Sistema",
    "QA-AUTO-35": "Sistema",
    "QA-AUTO-36": "Sistema",
    "QA-AUTO-37": "Sistema",
    "QA-AUTO-38": "Supervisor",
    "QA-AUTO-41": "Cliente",
    "QA-AUTO-42": "Agente",
    "QA-AUTO-43": "Sistema",
    "QA-AUTO-44": "Sistema",
    "QA-AUTO-45": "Sistema",
    "QA-AUTO-46": "Sistema",
    "QA-AUTO-47": "Sistema",
    "QA-AUTO-48": "Visitante",
    "QA-AUTO-49": "Visitante",
  };

  return byId[id] ?? "Sistema";
}

async function runCheck(id, name, check) {
  try {
    const evidence = await check();
    addResult(id, name, "OK", evidence);
  } catch (error) {
    addResult(id, name, "FALLO", error instanceof Error ? error.message : String(error));
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function fetchText(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  return { response, text };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchTextWithRetry(url, options = {}, attempts = 3) {
  let lastError = null;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fetchText(url, options);
    } catch (error) {
      lastError = error;

      if (attempt < attempts) {
        await sleep(300 * attempt);
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error("fetch failed");
}

function getCookieValue(setCookieHeader) {
  return setCookieHeader?.split(";")[0] ?? "";
}

async function loginViaApp(email, password) {
  const response = await fetch(`${appUrl}/api/auth/login`, {
    body: JSON.stringify({ email, password }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  const payload = await response.json().catch(() => null);
  const cookie = getCookieValue(response.headers.get("set-cookie"));

  assert(response.ok, `Login fallo para ${email}: ${JSON.stringify(payload)}`);
  assert(cookie.includes("pb_auth="), `No se recibio cookie de sesion para ${email}.`);

  return {
    cookie,
    payload,
  };
}

async function getPageWithCookie(pagePath, cookie) {
  const { response, text } = await fetchText(`${appUrl}${pagePath}`, {
    headers: {
      cookie,
    },
  });

  assert(response.ok, `GET ${pagePath} devolvio ${response.status}.`);
  return text;
}

async function fetchPage(pagePath, cookie) {
  return fetchText(`${appUrl}${pagePath}`, {
    headers: {
      cookie,
    },
  });
}

function assertIncludes(text, expected, message) {
  assert(text.includes(expected), message);
}

function assertExcludes(text, unexpected, message) {
  assert(!text.includes(unexpected), message);
}

function decodeHtmlEntities(value) {
  return value.replaceAll("&quot;", '"').replaceAll("&#x27;", "'").replaceAll("&amp;", "&");
}

function extractEnclosingForm(html, markerText) {
  const markerIndex = html.indexOf(markerText);
  assert(markerIndex !== -1, `No se encontro el marcador '${markerText}' en la pagina.`);

  const formStart = html.lastIndexOf("<form", markerIndex);
  const formEnd = html.indexOf("</form>", markerIndex);

  assert(formStart !== -1 && formEnd !== -1, `No se encontro el formulario que contiene '${markerText}'.`);
  return html.slice(formStart, formEnd + "</form>".length);
}

function getHiddenInputs(formHtml) {
  return [...formHtml.matchAll(/<input[^>]*type="hidden"[^>]*name="([^"]+)"(?:[^>]*value="([^"]*)")?[^>]*>/g)].map(
    ([, name, value = ""]) => ({
      name,
      value: decodeHtmlEntities(value),
    }),
  );
}

async function submitRenderedForm(pagePath, cookie, formHtml, fields = {}) {
  const formData = new FormData();

  for (const input of getHiddenInputs(formHtml)) {
    formData.append(input.name, input.value);
  }

  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value);
  }

  const { response, text } = await fetchText(`${appUrl}${pagePath}`, {
    body: formData,
    headers: {
      cookie,
    },
    method: "POST",
  });

  assert(response.ok, `POST ${pagePath} devolvio ${response.status}.`);
  return text;
}

function createTextFile(name, content) {
  return new File([content], name, { type: "text/plain" });
}

function createOversizedFile(name, sizeInBytes = 5 * 1024 * 1024 + 1) {
  return new File([new Uint8Array(sizeInBytes)], name, { type: "application/octet-stream" });
}

function calculateAverageHoursFromRecords(records, getEndTimestamp) {
  const durations = records
    .map((record) => {
      const createdAt = Date.parse(record.created_at || record.created || "");
      const endAt = Date.parse(getEndTimestamp(record) || "");

      if (Number.isNaN(createdAt) || Number.isNaN(endAt) || endAt < createdAt) {
        return null;
      }

      return (endAt - createdAt) / (1000 * 60 * 60);
    })
    .filter((duration) => duration !== null);

  if (durations.length === 0) {
    return null;
  }

  return Number((durations.reduce((sum, duration) => sum + duration, 0) / durations.length).toFixed(1));
}

function extractJsonObjectFromOutput(output) {
  const start = output.indexOf("{");
  const end = output.lastIndexOf("}");

  if (start === -1 || end === -1 || end < start) {
    return null;
  }

  return JSON.parse(output.slice(start, end + 1));
}

function runScript(command, extraEnv = {}) {
  return spawnSync("npm", ["run", command], {
    cwd: projectRoot,
    env: {
      ...process.env,
      ...extraEnv,
    },
    encoding: "utf8",
    shell: true,
  });
}

async function computeExpectedDashboardMetrics(adminPb) {
  const [tickets, departments] = await Promise.all([
    adminPb.collection("tickets").getFullList({ sort: "-updated_at" }),
    adminPb.collection("departments").getFullList({ sort: "name" }),
  ]);
  const agedThreshold = 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const departmentMap = new Map(departments.map((department) => [department.id, department.name]));
  const reopenedTickets = tickets.filter((ticket) => ticket.status === "reopened");
  const resolvedTickets = tickets.filter((ticket) => typeof ticket.resolved_at === "string" && ticket.resolved_at.length > 0);
  const closedTickets = tickets.filter((ticket) => typeof ticket.close_reason === "string" && ticket.close_reason.length > 0);
  const agedTickets = tickets.filter((ticket) => {
    const createdAt = Date.parse(ticket.created_at || ticket.created || "");
    return !Number.isNaN(createdAt) && now - createdAt > agedThreshold && ticket.status !== "closed";
  });
  const agedTicketsByStatus = ["new", "in_progress", "waiting", "resolved", "reopened", "closed"]
    .map((label) => ({ count: agedTickets.filter((ticket) => ticket.status === label).length, label }))
    .filter((item) => item.count > 0);
  const agedTicketsByDepartment = departments
    .map((department) => ({
      count: agedTickets.filter((ticket) => departmentMap.get(ticket.department_id) === department.name).length,
      label: department.name,
    }))
    .filter((item) => item.count > 0);

  return {
    agedTicketsByDepartment,
    agedTicketsByStatus,
    averageTimeToClosedHours: calculateAverageHoursFromRecords(closedTickets, (ticket) => ticket.updated_at || ticket.updated || ""),
    averageTimeToResolvedHours: calculateAverageHoursFromRecords(resolvedTickets, (ticket) => ticket.resolved_at || ""),
    reopenedRatePercent: tickets.length === 0 ? 0 : Number(((reopenedTickets.length / tickets.length) * 100).toFixed(1)),
  };
}

async function createAdminClient() {
  const pb = new PocketBase(pbUrl);
  pb.autoCancellation(false);
  await pb.collection("_superusers").authWithPassword(adminEmail, adminPassword);
  return pb;
}

async function createUserClient(email, password) {
  const pb = new PocketBase(pbUrl);
  pb.autoCancellation(false);
  const auth = await pb.collection("users").authWithPassword(email, password);
  return { pb, user: auth.record };
}

async function getUserByEmail(adminPb, email) {
  return adminPb.collection("users").getFirstListItem(`email = "${email}"`);
}

async function getNextTicketNumber(adminPb) {
  const records = await adminPb.collection("tickets").getFullList({
    fields: "ticket_number",
  });

  const latestSequence = records.reduce((max, record) => {
    const ticketNumber = typeof record.ticket_number === "string" ? record.ticket_number : "";
    const numericPart = ticketNumber.match(/(\d+)$/)?.[1];

    if (!numericPart) {
      return max;
    }

    const sequence = Number.parseInt(numericPart, 10);
    return Number.isNaN(sequence) ? max : Math.max(max, sequence);
  }, 0);

  return `TKT-${String(latestSequence + 1).padStart(5, "0")}`;
}

async function createResolvedTicket(adminPb, overrides = {}) {
  const customer = await getUserByEmail(adminPb, users.cliente.email);
  const agent = await getUserByEmail(adminPb, users.agente.email);
  const supportDept = await adminPb.collection("departments").getFirstListItem('name = "Soporte TI"');
  const ticketNumber = await getNextTicketNumber(adminPb);
  const timestamp = nowIso();

  return adminPb.collection("tickets").create({
    assigned_to: agent.id,
    category: "software",
    closed_at: null,
    created_at: timestamp,
    created_by: customer.id,
    department_id: supportDept.id,
    description: "Ticket temporal para verificacion QA automatizada.",
    priority: "high",
    resolved_at: timestamp,
    status: "resolved",
    ticket_number: ticketNumber,
    title: `QA resolved ${Date.now()}`,
    updated_at: timestamp,
    ...overrides,
  });
}

async function createReopenedTicket(adminPb, overrides = {}) {
  const timestamp = nowIso();

  return createResolvedTicket(adminPb, {
    closed_at: null,
    close_reason: "solucion_aplicada",
    close_reason_detail: "",
    reopen_reason: "problema_persistente",
    reopen_reason_detail: "",
    resolution_note: "Resolucion base para QA automatizada.",
    status: "reopened",
    updated_at: timestamp,
    ...overrides,
  });
}

async function createClosedTicket(adminPb, overrides = {}) {
  const timestamp = nowIso();

  return createResolvedTicket(adminPb, {
    close_reason: "solucion_aplicada",
    close_reason_detail: "",
    closed_at: timestamp,
    reopen_reason: null,
    reopen_reason_detail: null,
    resolution_note: "Resolucion base para QA automatizada.",
    status: "closed",
    updated_at: timestamp,
    ...overrides,
  });
}

async function submitStatusForm(pagePath, cookie, fields) {
  const page = await getPageWithCookie(pagePath, cookie);
  const formHtml = extractEnclosingForm(page, "Cambiar estado");
  return submitRenderedForm(pagePath, cookie, formHtml, fields);
}

async function submitCustomerResolutionForm(pagePath, cookie, fields) {
  const page = await getPageWithCookie(pagePath, cookie);
  const formHtml = extractEnclosingForm(page, "Respuesta del cliente sobre ticket resuelto");
  return submitRenderedForm(pagePath, cookie, formHtml, fields);
}

async function submitCommentForm(pagePath, cookie, fields) {
  const page = await getPageWithCookie(pagePath, cookie);
  const formHtml = extractEnclosingForm(page, "Nuevo comentario");
  return submitRenderedForm(pagePath, cookie, formHtml, fields);
}

async function submitReassignForm(pagePath, cookie, fields) {
  const page = await getPageWithCookie(pagePath, cookie);
  const formHtml = extractEnclosingForm(page, "Reasignar ticket");
  return submitRenderedForm(pagePath, cookie, formHtml, fields);
}

async function submitNewTicketForm(cookie, fields) {
  const page = await getPageWithCookie("/app/tickets/new", cookie);
  const formHtml = extractEnclosingForm(page, "Crear ticket");
  return submitRenderedForm("/app/tickets/new", cookie, formHtml, fields);
}

async function writeReport() {
  fs.mkdirSync(reportDir, { recursive: true });

  const passed = results.filter((result) => result.status === "OK").length;
  const failed = results.length - passed;
  const finalStatus = failed === 0 ? "OK" : "FALLO";
  const recommendation = failed === 0 ? "Aprobado para continuar" : "No aprobado";
  const openIncidents = results.filter((result) => result.status !== "OK");
  const lines = [
    "# Registro de Ejecucion QA Automatizada",
    "",
    "## Datos generales",
    "",
    `- Fecha: ${nowIso()}`,
    "- Entorno: Local",
    `- Version o referencia del build: QA_APP_URL=${appUrl}`,
    "- Ejecutado por: Script qa:verify",
    "- Documento base usado: plantilla-registro-ejecucion-qa.md",
    "",
    "## Resultado general",
    "",
    `- Estado final: ${finalStatus}`,
    `- Resumen ejecutivo: ${passed} casos OK, ${failed} casos con fallo.`,
    `- Recomendacion final: ${recommendation}`,
    "",
    "## Registro por caso",
    "",
    "| ID caso | Rol | Resultado | Evidencia breve | Incidencia detectada | Observaciones |",
    "| --- | --- | --- | --- | --- | --- |",
    ...results.map((result) => {
      const role = getRoleForResult(result.id);
      const incident = result.status === "OK" ? "" : result.evidence;
      const observation = result.status === "OK" ? "Validacion automatizada exitosa" : "Revisar evidencia e incidencia";
      return `| ${result.id} | ${role} | ${result.status} | ${result.evidence.replaceAll("|", "\\|")} | ${incident.replaceAll("|", "\\|")} | ${observation} |`;
    }),
    "",
    "## Incidencias abiertas",
    "",
    "| ID incidencia | Severidad | Caso asociado | Descripcion | Estado |",
    "| --- | --- | --- | --- | --- |",
    ...(openIncidents.length === 0
      ? ["| Sin incidencias | Baja | - | No se detectaron incidencias abiertas en la ejecucion automatizada. | Cerrada |"]
      : openIncidents.map((result, index) => `| INC-AUTO-${String(index + 1).padStart(3, "0")} | Alta | ${result.id} | ${result.evidence.replaceAll("|", "\\|")} | Abierta |`)),
    "",
    "## Checklist de cierre",
    "",
    `- ${results.length > 0 ? "x" : " "} Se ejecutaron los casos criticos`,
    `- ${passed > 0 ? "x" : " "} Se registraron evidencias minimas`,
    `- ${true ? "x" : " "} Las incidencias quedaron documentadas`,
    `- ${recommendation ? "x" : " "} Se definio recomendacion final`,
    "",
    "## Resumen tecnico",
    "",
    `- App URL: ${appUrl}`,
    `- PocketBase URL: ${pbUrl}`,
    `- Casos OK: ${passed}`,
    `- Casos con fallo: ${failed}`,
    "",
    "## Firma o responsable",
    "",
    "- Nombre: Script qa:verify",
    `- Fecha de cierre: ${nowIso()}`,
    "",
  ];

  const reportPath = path.join(reportDir, `qa-verify-${safeTimestamp()}.md`);
  const reportContent = `${lines.join("\n")}\n`;
  fs.writeFileSync(reportPath, reportContent, "utf8");
  fs.writeFileSync(path.join(reportDir, "qa-verify-latest.md"), reportContent, "utf8");
  return reportPath;
}

async function main() {
  await runCheck("QA-AUTO-01", "Health endpoint", async () => {
    const response = await fetch(`${appUrl}/api/health`);
    const json = await response.json();

    assert(response.ok, `Health devolvio ${response.status}.`);
    assert(json.ok === true, "Health no devolvio ok=true.");
    return "`/api/health` respondio 200 con ok=true.";
  });

  await runCheck("QA-AUTO-02", "Login cliente", async () => {
    const session = await loginViaApp(users.cliente.email, users.cliente.password);
    assert(session.payload?.redirectTo === "/app/tickets", "Redirect inesperado para cliente.");
    const page = await getPageWithCookie("/app/tickets", session.cookie);
    assert(page.includes("Mis tickets"), "La pagina de cliente no contiene 'Mis tickets'.");
    return "Cliente autenticado y vista `/app/tickets` accesible.";
  });

  await runCheck("QA-AUTO-03", "Login agente", async () => {
    const session = await loginViaApp(users.agente.email, users.agente.password);
    assert(session.payload?.redirectTo === "/app/agent/tickets", "Redirect inesperado para agente.");
    const page = await getPageWithCookie("/app/agent/tickets", session.cookie);
    assert(page.includes("Cola operativa del agente"), "La vista de agente no cargo el contenido esperado.");
    return "Agente autenticado y vista `/app/agent/tickets` accesible.";
  });

  await runCheck("QA-AUTO-04", "Login supervisor", async () => {
    const session = await loginViaApp(users.supervisor.email, users.supervisor.password);
    assert(session.payload?.redirectTo === "/app/supervisor/dashboard", "Redirect inesperado para supervisor.");
    const dashboard = await getPageWithCookie("/app/supervisor/dashboard", session.cookie);
    const departments = await getPageWithCookie("/app/supervisor/departments", session.cookie);
    assert(dashboard.includes("Dashboard de supervisor"), "La vista de dashboard no cargo el contenido esperado.");
    assert(departments.includes("Gestion basica de departamentos"), "La vista de departamentos no cargo el contenido esperado.");
    return "Supervisor autenticado con dashboard y departamentos accesibles.";
  });

  await runCheck("QA-AUTO-05", "Creacion real de ticket y visibilidad en la app", async () => {
    const adminPb = await createAdminClient();
    const { pb: customerPb, user } = await createUserClient(users.cliente.email, users.cliente.password);
    const supportDept = await adminPb.collection("departments").getFirstListItem('name = "Soporte TI"');
    const ticketNumber = await getNextTicketNumber(adminPb);
    const title = `QA automatizado ${Date.now()}`;
    const timestamp = nowIso();

    const record = await customerPb.collection("tickets").create({
      category: "software",
      created_at: timestamp,
      created_by: user.id,
      department_id: supportDept.id,
      description: "Ticket creado por verificacion QA automatizada.",
      priority: "high",
      status: "new",
      ticket_number: ticketNumber,
      title,
      updated_at: timestamp,
    });

    const appSession = await loginViaApp(users.cliente.email, users.cliente.password);
    const listPage = await getPageWithCookie(`/app/tickets?q=${encodeURIComponent(ticketNumber)}`, appSession.cookie);
    const detailPage = await getPageWithCookie(`/app/tickets/${record.id}`, appSession.cookie);
    assert(listPage.includes(ticketNumber), `La lista del cliente no mostro ${ticketNumber}.`);
    assert(detailPage.includes(title), "El detalle del ticket creado no mostro el titulo esperado.");

    const agentSession = await loginViaApp(users.agente.email, users.agente.password);
    const agentQueue = await getPageWithCookie(`/app/agent/tickets?q=${encodeURIComponent(ticketNumber)}`, agentSession.cookie);
    assert(agentQueue.includes(ticketNumber), "La cola del agente no mostro el ticket nuevo del departamento.");

    return `Ticket ${ticketNumber} creado y visible en cliente/agente.`;
  });

  await runCheck("QA-AUTO-06", "Visibilidad de comentario interno", async () => {
    const customerSession = await loginViaApp(users.cliente.email, users.cliente.password);
    const agentSession = await loginViaApp(users.agente.email, users.agente.password);
    const adminPb = await createAdminClient();
    const ticket = await adminPb.collection("tickets").getFirstListItem('ticket_number = "TKT-00001"');
    const internalText = "Se detecto sincronizacion pendiente con el proveedor de identidad.";
    const customerDetail = await getPageWithCookie(`/app/tickets/${ticket.id}`, customerSession.cookie);
    const agentDetail = await getPageWithCookie(`/app/agent/tickets/${ticket.id}`, agentSession.cookie);

    assert(!customerDetail.includes(internalText), "El cliente vio un comentario interno que debia estar oculto.");
    assert(agentDetail.includes(internalText), "El agente no vio el comentario interno esperado.");

    return "Comentario interno oculto para cliente y visible para agente.";
  });

  await runCheck("QA-AUTO-06A", "Cliente no accede por URL a ticket ajeno", async () => {
    const session = await loginViaApp(users.cliente.email, users.cliente.password);
    const adminPb = await createAdminClient();
    const foreignTicket = await adminPb.collection("tickets").getFirstListItem('ticket_number = "TKT-00002"');
    const { response, text } = await fetchPage(`/app/tickets/${foreignTicket.id}`, session.cookie);

    assert(response.status === 404, `Se esperaba 404 y se obtuvo ${response.status} para ticket ajeno del cliente.`);
    assertIncludes(text, "404", "La respuesta de ticket ajeno para cliente no renderizo not found.");

    return "Cliente recibe 404 al intentar abrir ticket ajeno por URL directa.";
  });

  await runCheck("QA-AUTO-06B", "Filtros y busqueda en vista cliente", async () => {
    const session = await loginViaApp(users.cliente.email, users.cliente.password);
    const byStatus = await getPageWithCookie("/app/tickets?status=in_progress", session.cookie);
    const byQuery = await getPageWithCookie("/app/tickets?q=TKT-00001", session.cookie);

    assertIncludes(byStatus, "TKT-00001", "El filtro status=in_progress no mostro TKT-00001 para cliente.");
    assertExcludes(byStatus, "TKT-00004", "El filtro status=in_progress mostro TKT-00004 incorrectamente para cliente.");
    assertIncludes(byQuery, "TKT-00001", "La busqueda por TKT-00001 no devolvio el ticket esperado para cliente.");

    return "Cliente filtra por estado y busca por numero correctamente.";
  });

  await runCheck("QA-AUTO-06C", "Filtros y busqueda en vista agente", async () => {
    const session = await loginViaApp(users.agente.email, users.agente.password);
    const byStatus = await getPageWithCookie("/app/agent/tickets?status=in_progress", session.cookie);
    const byQuery = await getPageWithCookie("/app/agent/tickets?q=TKT-00001", session.cookie);

    assertIncludes(byStatus, "TKT-00001", "El filtro status=in_progress no mostro TKT-00001 para agente.");
    assertIncludes(byQuery, "TKT-00001", "La busqueda por TKT-00001 no devolvio el ticket esperado para agente.");

    return "Agente filtra y busca tickets en su cola operativa.";
  });

  await runCheck("QA-AUTO-06D", "Filtros y busqueda en vista supervisor", async () => {
    const session = await loginViaApp(users.supervisor.email, users.supervisor.password);
    const byStatus = await getPageWithCookie("/app/supervisor/tickets?status=waiting", session.cookie);
    const byCategory = await getPageWithCookie("/app/supervisor/tickets?category=network", session.cookie);
    const byQuery = await getPageWithCookie("/app/supervisor/tickets?q=TKT-00002", session.cookie);

    assertIncludes(byStatus, "TKT-00002", "El filtro status=waiting no mostro TKT-00002 para supervisor.");
    assertExcludes(byStatus, "TKT-00001", "El filtro status=waiting mostro TKT-00001 incorrectamente para supervisor.");
    assertIncludes(byCategory, "TKT-00002", "El filtro category=network no mostro TKT-00002 para supervisor.");
    assertIncludes(byQuery, "TKT-00002", "La busqueda por TKT-00002 no devolvio el ticket esperado para supervisor.");

    return "Supervisor filtra por estado/categoria y busca por numero correctamente.";
  });

  await runCheck("QA-AUTO-06E", "Agente no accede por URL a ticket fuera de su contexto", async () => {
    const session = await loginViaApp(users.agente.email, users.agente.password);
    const adminPb = await createAdminClient();
    const foreignTicket = await adminPb.collection("tickets").getFirstListItem('ticket_number = "TKT-00002"');
    const { response, text } = await fetchPage(`/app/agent/tickets/${foreignTicket.id}`, session.cookie);

    assert(response.status === 404, `Se esperaba 404 y se obtuvo ${response.status} para ticket fuera de contexto del agente.`);
    assertIncludes(text, "404", "La respuesta de ticket fuera de contexto para agente no renderizo not found.");

    return "Agente recibe 404 al intentar abrir ticket fuera de su contexto por URL directa.";
  });

  await runCheck("QA-AUTO-07", "Creacion y edicion de departamento", async () => {
    const adminPb = await createAdminClient();
    const { pb: supervisorPb } = await createUserClient(users.supervisor.email, users.supervisor.password);
    const supervisorSession = await loginViaApp(users.supervisor.email, users.supervisor.password);
    const suffix = Date.now();
    const name = `QA Dept ${suffix}`;
    const created = await supervisorPb.collection("departments").create({
      active: true,
      contact_email: `qa.dept.${suffix}@techsupport.local`,
      created_at: nowIso(),
      description: "Departamento creado por QA automatizada.",
      name,
      updated_at: nowIso(),
    });

    await supervisorPb.collection("departments").update(created.id, {
      description: "Departamento editado por QA automatizada.",
      updated_at: nowIso(),
    });

    const persisted = await adminPb.collection("departments").getOne(created.id);
    const page = await getPageWithCookie("/app/supervisor/departments", supervisorSession.cookie);
    assert(persisted.description === "Departamento editado por QA automatizada.", "La edicion del departamento no quedo persistida.");
    assert(page.includes(name), "La vista de departamentos no mostro el departamento creado.");

    return `Departamento ${name} creado, editado y visible en supervisor.`;
  });

  await runCheck("QA-AUTO-10", "Vista de usuarios internos", async () => {
    const session = await loginViaApp(users.supervisor.email, users.supervisor.password);
    const page = await getPageWithCookie("/app/supervisor/users", session.cookie);

    assertIncludes(page, "Administracion operativa de usuarios", "La vista de usuarios internos no cargo el titulo esperado.");
    assertIncludes(page, "diego.soporte@techsupport.local", "La vista de usuarios internos no mostro al segundo agente IT.");
    assertExcludes(page, "cliente@acme.com", "La vista de usuarios internos mezclo clientes en la administracion interna.");

    return "Supervisor accede a `/app/supervisor/users` y ve solo usuarios internos.";
  });

  await runCheck("QA-AUTO-11", "Actualizacion de departamento y estado de usuario interno", async () => {
    const adminPb = await createAdminClient();
    const session = await loginViaApp(users.supervisor.email, users.supervisor.password);
    const diego = await getUserByEmail(adminPb, "diego.soporte@techsupport.local");
    const supportDept = await adminPb.collection("departments").getFirstListItem('name = "Soporte TI"');
    const networkDept = await adminPb.collection("departments").getFirstListItem('name = "Redes"');
    const page = await getPageWithCookie("/app/supervisor/users", session.cookie);
    const diegoForm = extractEnclosingForm(page, "diego.soporte@techsupport.local");

    const responseText = await submitRenderedForm("/app/supervisor/users", session.cookie, diegoForm, {
      active: "false",
      departmentId: networkDept.id,
      role: "agente",
      userId: diego.id,
    });

    const persisted = await adminPb.collection("users").getOne(diego.id);

    assertIncludes(responseText, "Usuario actualizado correctamente.", "La UI no mostro confirmacion de actualizacion del usuario interno.");
    assert(persisted.active === false, "La actualizacion del usuario interno no guardo active=false.");
    assert(persisted.department_id === networkDept.id, "La actualizacion del usuario interno no guardo el nuevo departamento.");

    await adminPb.collection("users").update(diego.id, {
      active: true,
      department_id: supportDept.id,
      role: "agente",
      updated: nowIso(),
    });

    return `Supervisor actualizo a diego.soporte@techsupport.local con department=${networkDept.name} y active=false.`;
  });

  await runCheck("QA-AUTO-12", "Validacion de agente sin departamento", async () => {
    const adminPb = await createAdminClient();
    const session = await loginViaApp(users.supervisor.email, users.supervisor.password);
    const diego = await getUserByEmail(adminPb, "diego.soporte@techsupport.local");
    const supportDept = await adminPb.collection("departments").getFirstListItem('name = "Soporte TI"');
    const page = await getPageWithCookie("/app/supervisor/users", session.cookie);
    const diegoForm = extractEnclosingForm(page, "diego.soporte@techsupport.local");

    const responseText = await submitRenderedForm("/app/supervisor/users", session.cookie, diegoForm, {
      active: "true",
      departmentId: "",
      role: "agente",
      userId: diego.id,
    });

    const persisted = await adminPb.collection("users").getOne(diego.id);

    assertIncludes(responseText, "Los agentes deben quedar asignados a un departamento.", "La UI no mostro la validacion esperada para agente sin departamento.");
    assert(persisted.department_id === supportDept.id, "La validacion fallo y dejo al agente sin el departamento original.");
    assert(persisted.active === true, "La validacion fallo y modifico el estado activo del usuario.");

    return "La UI bloquea guardar un agente sin departamento y preserva los datos persistidos.";
  });

  await runCheck("QA-AUTO-13", "Resolucion con nota obligatoria", async () => {
    const adminPb = await createAdminClient();
    const agentSession = await loginViaApp(users.agente.email, users.agente.password);
    const ticket = await createResolvedTicket(adminPb, {
      status: "in_progress",
      resolution_note: null,
      title: `QA 4.4 resolve required ${Date.now()}`,
    });
    const pagePath = `/app/agent/tickets/${ticket.id}`;

    const missingResolution = await submitStatusForm(pagePath, agentSession.cookie, {
      nextStatus: "resolved",
      resolutionNote: "",
      returnPath: pagePath,
      ticketId: ticket.id,
    });

    const validResolve = await submitStatusForm(pagePath, agentSession.cookie, {
      nextStatus: "resolved",
      resolutionNote: "Se aplico ajuste definitivo y se valido con el usuario.",
      returnPath: pagePath,
      ticketId: ticket.id,
    });

    const persisted = await adminPb.collection("tickets").getOne(ticket.id);

    assertIncludes(missingResolution, "Ingresa una nota de resolucion antes de marcar el ticket como resuelto.", "No se bloqueo el cambio a resolved sin nota de resolucion.");
    assertIncludes(validResolve, "Estado actualizado correctamente.", "La UI no mostro exito al resolver con nota valida.");
    assert(persisted.status === "resolved", "La resolucion valida no persistio el estado resolved.");
    assert(persisted.resolution_note === "Se aplico ajuste definitivo y se valido con el usuario.", "El cierre valido no persistio resolution_note.");

    return `El ticket ${persisted.ticket_number} exige nota de resolucion y persiste resolution_note al resolver.`;
  });

  await runCheck("QA-AUTO-14", "Agente no puede cerrar ni reabrir ticket resuelto", async () => {
    const adminPb = await createAdminClient();
    const agentSession = await loginViaApp(users.agente.email, users.agente.password);
    const ticket = await createResolvedTicket(adminPb, {
      title: `QA 4.4 internal blocked ${Date.now()}`,
    });
    const pagePath = `/app/agent/tickets/${ticket.id}`;

    const forbiddenClose = await submitStatusForm(pagePath, agentSession.cookie, {
      closeReason: "solucion_aplicada",
      nextStatus: "closed",
      resolutionNote: "No deberia cerrar directamente.",
      returnPath: pagePath,
      ticketId: ticket.id,
    });

    const forbiddenReopen = await submitStatusForm(pagePath, agentSession.cookie, {
      nextStatus: "reopened",
      reopenReason: "problema_persistente",
      returnPath: pagePath,
      ticketId: ticket.id,
    });

    const persisted = await adminPb.collection("tickets").getOne(ticket.id);

    assertIncludes(forbiddenClose, "El cierre final debe confirmarlo el cliente desde un ticket resuelto.", "El agente no fue bloqueado al intentar cerrar un ticket resuelto.");
    assertIncludes(forbiddenReopen, "La reapertura debe solicitarla el cliente desde un ticket resuelto.", "El agente no fue bloqueado al intentar reabrir un ticket resuelto.");
    assert(persisted.status === "resolved", "El ticket cambio de estado aunque el agente debia quedar bloqueado.");

    return `El ticket ${persisted.ticket_number} bloquea cierre y reapertura manual desde la vista operativa interna.`;
  });

  await runCheck("QA-AUTO-15", "Cliente confirma cierre o solicita reapertura con validaciones completas", async () => {
    const adminPb = await createAdminClient();
    const customerSession = await loginViaApp(users.cliente.email, users.cliente.password);
    const closeTicket = await createResolvedTicket(adminPb, {
      title: `QA 4.4 close other ${Date.now()}`,
    });
    const reopenTicket = await createResolvedTicket(adminPb, {
      title: `QA 4.4 reopen other ${Date.now()}`,
    });

    const closePath = `/app/tickets/${closeTicket.id}`;
    const reopenPath = `/app/tickets/${reopenTicket.id}`;

    const missingCloseReason = await submitCustomerResolutionForm(closePath, customerSession.cookie, {
      decision: "close",
      returnPath: closePath,
      ticketId: closeTicket.id,
    });

    const missingCloseDetail = await submitCustomerResolutionForm(closePath, customerSession.cookie, {
      closeReason: "otro",
      decision: "close",
      returnPath: closePath,
      ticketId: closeTicket.id,
    });

    const validCloseOther = await submitCustomerResolutionForm(closePath, customerSession.cookie, {
      closeReason: "otro",
      closeReasonDetail: "Cierre por criterio operativo confirmado con el usuario.",
      decision: "close",
      returnPath: closePath,
      ticketId: closeTicket.id,
    });

    const missingReopenReason = await submitCustomerResolutionForm(reopenPath, customerSession.cookie, {
      decision: "reopen",
      returnPath: reopenPath,
      ticketId: reopenTicket.id,
    });

    const missingReopenDetail = await submitCustomerResolutionForm(reopenPath, customerSession.cookie, {
      decision: "reopen",
      reopenReason: "otro",
      returnPath: reopenPath,
      ticketId: reopenTicket.id,
    });

    const validReopenOther = await submitCustomerResolutionForm(reopenPath, customerSession.cookie, {
      decision: "reopen",
      reopenReason: "otro",
      reopenReasonDetail: "El usuario reporto un impacto distinto al cierre previo.",
      returnPath: reopenPath,
      ticketId: reopenTicket.id,
    });

    const persistedClose = await adminPb.collection("tickets").getOne(closeTicket.id);
    const persistedReopen = await adminPb.collection("tickets").getOne(reopenTicket.id);

    assertIncludes(missingCloseReason, "Selecciona un motivo de cierre valido.", "No se bloqueo el cierre por cliente sin motivo obligatorio.");
    assertIncludes(missingCloseDetail, "Describe el motivo de cierre cuando eliges &#x27;otro&#x27;.", "No se bloqueo closeReason=otro sin detalle libre.");
    assertExcludes(validCloseOther, "No fue posible responder el ticket resuelto.", "La respuesta de cierre por cliente devolvio error inesperado.");
    assertIncludes(missingReopenReason, "Selecciona un motivo de reapertura valido.", "No se bloqueo la reapertura por cliente sin motivo obligatorio.");
    assertIncludes(missingReopenDetail, "Describe el motivo de reapertura cuando eliges &#x27;otro&#x27;.", "No se bloqueo reopenReason=otro sin detalle libre.");
    assertExcludes(validReopenOther, "No fue posible responder el ticket resuelto.", "La respuesta de reapertura por cliente devolvio error inesperado.");
    assert(persistedClose.status === "closed", "El cierre confirmado por cliente no persistio el estado closed.");
    assert(persistedClose.close_reason === "otro", "El cierre con motivo 'otro' no persistio close_reason.");
    assert(persistedClose.close_reason_detail === "Cierre por criterio operativo confirmado con el usuario.", "El cierre con motivo 'otro' no persistio close_reason_detail.");
    assert(persistedReopen.status === "reopened", "La reapertura solicitada por cliente no persistio el estado reopened.");
    assert(persistedReopen.reopen_reason === "otro", "La reapertura con motivo 'otro' no persistio reopen_reason.");
    assert(persistedReopen.reopen_reason_detail === "El usuario reporto un impacto distinto al cierre previo.", "La reapertura con motivo 'otro' no persistio reopen_reason_detail.");

    return "El cliente puede cerrar o solicitar reapertura desde resolved con validaciones de motivo y detalle libre cuando aplica.";
  });

  await runCheck("QA-AUTO-16", "Visibilidad de seguimiento de cierre para cliente", async () => {
    const adminPb = await createAdminClient();
    const customerSession = await loginViaApp(users.cliente.email, users.cliente.password);
    const closedTicket = await createClosedTicket(adminPb, {
      resolution_note: "Se reemplazo el componente y se valido la operacion.",
      title: `QA 4.4 visibility customer closed ${Date.now()}`,
      updated_at: nowIso(),
    });
    const reopenedTicket = await createReopenedTicket(adminPb, {
      resolution_note: "Se reemplazo el componente y se valido la operacion.",
      title: `QA 4.4 visibility customer reopened ${Date.now()}`,
      updated_at: nowIso(),
    });

    const closedDetail = await getPageWithCookie(`/app/tickets/${closedTicket.id}`, customerSession.cookie);
    const reopenedDetail = await getPageWithCookie(`/app/tickets/${reopenedTicket.id}`, customerSession.cookie);

    assertIncludes(closedDetail, "Seguimiento de cierre", "El cliente no vio el bloque de seguimiento de cierre en ticket cerrado.");
    assertIncludes(closedDetail, "Motivo de cierre:", "El cliente no vio el motivo de cierre en ticket cerrado.");
    assertIncludes(closedDetail, "Solucion aplicada", "El cliente no vio la etiqueta del motivo de cierre en ticket cerrado.");
    assertIncludes(closedDetail, "Nota de resolucion:", "El cliente no vio la nota de resolucion en ticket cerrado.");
    assertIncludes(closedDetail, "Se reemplazo el componente y se valido la operacion.", "El cliente no vio el texto de resolucion en ticket cerrado.");
    assertExcludes(closedDetail, "Motivo de reapertura:", "El ticket cerrado mostro motivo de reapertura cuando no debia.");
    assertIncludes(reopenedDetail, "Seguimiento de cierre", "El cliente no vio el bloque de seguimiento de cierre en ticket reabierto.");
    assertIncludes(reopenedDetail, "Motivo de reapertura:", "El cliente no vio el motivo de reapertura en ticket reabierto.");
    assertIncludes(reopenedDetail, "Problema persistente", "El cliente no vio la etiqueta del motivo de reapertura en ticket reabierto.");

    return `El cliente ve cierre en ${closedTicket.ticket_number} y reapertura en ${reopenedTicket.ticket_number}.`;
  });

  await runCheck("QA-AUTO-16A", "Visibilidad de seguimiento de cierre para supervisor", async () => {
    const adminPb = await createAdminClient();
    const supervisorSession = await loginViaApp(users.supervisor.email, users.supervisor.password);
    const closedTicket = await createClosedTicket(adminPb, {
      resolution_note: "Se reemplazo el componente y se valido la operacion.",
      title: `QA 4.4 visibility supervisor closed ${Date.now()}`,
      updated_at: nowIso(),
    });
    const reopenedTicket = await createReopenedTicket(adminPb, {
      resolution_note: "Se reemplazo el componente y se valido la operacion.",
      title: `QA 4.4 visibility supervisor reopened ${Date.now()}`,
      updated_at: nowIso(),
    });

    const closedDetail = await getPageWithCookie(`/app/supervisor/tickets/${closedTicket.id}`, supervisorSession.cookie);
    const reopenedDetail = await getPageWithCookie(`/app/supervisor/tickets/${reopenedTicket.id}`, supervisorSession.cookie);

    assertIncludes(closedDetail, "Seguimiento de cierre", "El supervisor no vio el bloque de seguimiento de cierre en ticket cerrado.");
    assertIncludes(closedDetail, "Motivo de cierre:", "El supervisor no vio el motivo de cierre en ticket cerrado.");
    assertIncludes(closedDetail, "Solucion aplicada", "El supervisor no vio la etiqueta del motivo de cierre en ticket cerrado.");
    assertIncludes(closedDetail, "Nota de resolucion:", "El supervisor no vio la nota de resolucion en ticket cerrado.");
    assertIncludes(closedDetail, "Se reemplazo el componente y se valido la operacion.", "El supervisor no vio el texto de resolucion en ticket cerrado.");
    assertExcludes(closedDetail, "Motivo de reapertura:", "El ticket cerrado mostro motivo de reapertura cuando no debia para supervisor.");
    assertIncludes(reopenedDetail, "Seguimiento de cierre", "El supervisor no vio el bloque de seguimiento de cierre en ticket reabierto.");
    assertIncludes(reopenedDetail, "Motivo de reapertura:", "El supervisor no vio el motivo de reapertura en ticket reabierto.");
    assertIncludes(reopenedDetail, "Problema persistente", "El supervisor no vio la etiqueta del motivo de reapertura en ticket reabierto.");

    return `El supervisor ve cierre en ${closedTicket.ticket_number} y reapertura en ${reopenedTicket.ticket_number}.`;
  });

  await runCheck("QA-AUTO-16B", "Visibilidad de seguimiento de cierre para agente", async () => {
    const adminPb = await createAdminClient();
    const agentSession = await loginViaApp(users.agente.email, users.agente.password);
    const closedTicket = await createClosedTicket(adminPb, {
      resolution_note: "Se reemplazo el componente y se valido la operacion.",
      title: `QA 4.4 visibility agent closed ${Date.now()}`,
      updated_at: nowIso(),
    });
    const reopenedTicket = await createReopenedTicket(adminPb, {
      resolution_note: "Se reemplazo el componente y se valido la operacion.",
      title: `QA 4.4 visibility agent reopened ${Date.now()}`,
      updated_at: nowIso(),
    });

    const closedDetail = await getPageWithCookie(`/app/agent/tickets/${closedTicket.id}`, agentSession.cookie);
    const reopenedDetail = await getPageWithCookie(`/app/agent/tickets/${reopenedTicket.id}`, agentSession.cookie);

    assertIncludes(closedDetail, "Seguimiento de cierre", "El agente no vio el bloque de seguimiento de cierre en ticket cerrado.");
    assertIncludes(closedDetail, "Motivo de cierre:", "El agente no vio el motivo de cierre en ticket cerrado.");
    assertIncludes(closedDetail, "Solucion aplicada", "El agente no vio la etiqueta del motivo de cierre en ticket cerrado.");
    assertIncludes(closedDetail, "Nota de resolucion:", "El agente no vio la nota de resolucion en ticket cerrado.");
    assertIncludes(closedDetail, "Se reemplazo el componente y se valido la operacion.", "El agente no vio el texto de resolucion en ticket cerrado.");
    assertExcludes(closedDetail, "Motivo de reapertura:", "El ticket cerrado mostro motivo de reapertura cuando no debia para agente.");
    assertIncludes(reopenedDetail, "Seguimiento de cierre", "El agente no vio el bloque de seguimiento de cierre en ticket reabierto.");
    assertIncludes(reopenedDetail, "Motivo de reapertura:", "El agente no vio el motivo de reapertura en ticket reabierto.");
    assertIncludes(reopenedDetail, "Problema persistente", "El agente no vio la etiqueta del motivo de reapertura en ticket reabierto.");

    return `El agente ve cierre en ${closedTicket.ticket_number} y reapertura en ${reopenedTicket.ticket_number}.`;
  });

  await runCheck("QA-AUTO-17", "Ticket con adjunto visible en detalle", async () => {
    const adminPb = await createAdminClient();
    const customerSession = await loginViaApp(users.cliente.email, users.cliente.password);
    const customer = await getUserByEmail(adminPb, users.cliente.email);
    const supportDept = await adminPb.collection("departments").getFirstListItem('name = "Soporte TI"');
    const ticketTitle = `QA 4.1 adjunto ticket ${Date.now()}`;

    const responseText = await submitNewTicketForm(customerSession.cookie, {
      attachments: createTextFile("qa-attachment-ticket.txt", "Adjunto de ticket para QA automatizada."),
      category: "software",
      departmentId: supportDept.id,
      description: "Ticket con adjunto creado desde qa:verify.",
      priority: "high",
      title: ticketTitle,
    });

    const ticket = await adminPb.collection("tickets").getFirstListItem(`title = "${ticketTitle}" && created_by = "${customer.id}"`);
    const customerDetail = await getPageWithCookie(`/app/tickets/${ticket.id}`, customerSession.cookie);
    const agentSession = await loginViaApp(users.agente.email, users.agente.password);
    const agentQueue = await getPageWithCookie(`/app/agent/tickets?q=${encodeURIComponent(ticket.ticket_number)}`, agentSession.cookie);
    const agentDetail = await getPageWithCookie(`/app/agent/tickets/${ticket.id}`, agentSession.cookie);
    const persistedAttachment = Array.isArray(ticket.attachments) ? ticket.attachments[0] : "";

    assertIncludes(responseText, "/app/tickets?created=1", "La creacion de ticket con adjunto no redirigio al listado del cliente.");
    assert(persistedAttachment.startsWith("qa_attachment_ticket_"), "El ticket no persistio el adjunto esperado.");
    assertIncludes(customerDetail, "Adjuntos", "El detalle del cliente no mostro la seccion de adjuntos del ticket.");
    assertIncludes(customerDetail, persistedAttachment, "El cliente no vio el adjunto del ticket en detalle.");
    assertIncludes(agentQueue, ticket.ticket_number, "El ticket con adjunto no aparecio en la cola del agente.");
    assertIncludes(agentDetail, persistedAttachment, "El agente no vio el adjunto del ticket en detalle.");

    return `El ticket ${ticket.ticket_number} persiste adjunto y lo muestra en detalle para cliente y agente.`;
  });

  await runCheck("QA-AUTO-18", "Comentario con adjunto visible segun rol", async () => {
    const adminPb = await createAdminClient();
    const ticket = await createResolvedTicket(adminPb, {
      title: `QA 4.1 adjunto comentario ${Date.now()}`,
    });
    const agentSession = await loginViaApp(users.agente.email, users.agente.password);
    const customerSession = await loginViaApp(users.cliente.email, users.cliente.password);
    const pagePath = `/app/agent/tickets/${ticket.id}`;

    const responseText = await submitCommentForm(pagePath, agentSession.cookie, {
      attachments: createTextFile("qa-attachment-comment.txt", "Adjunto de comentario para QA automatizada."),
      content: "Comentario publico con adjunto desde qa:verify.",
      returnPath: pagePath,
      ticketId: ticket.id,
    });

    const comment = await adminPb.collection("comments").getFirstListItem(`ticket_id = "${ticket.id}" && content = "Comentario publico con adjunto desde qa:verify."`);
    const agentDetail = await getPageWithCookie(pagePath, agentSession.cookie);
    const customerDetail = await getPageWithCookie(`/app/tickets/${ticket.id}`, customerSession.cookie);
    const persistedAttachment = Array.isArray(comment.attachments) ? comment.attachments[0] : "";

    assertIncludes(responseText, "Comentario agregado correctamente.", "La UI no mostro exito al guardar comentario con adjunto.");
    assert(persistedAttachment.startsWith("qa_attachment_comment_"), "El comentario no persistio el adjunto esperado.");
    assertIncludes(agentDetail, persistedAttachment, "El agente no vio el adjunto del comentario en detalle.");
    assertIncludes(customerDetail, persistedAttachment, "El cliente no vio el adjunto del comentario publico en detalle.");

    return `El comentario publico sobre ${ticket.ticket_number} persiste adjunto y es visible para agente y cliente.`;
  });

  await runCheck("QA-AUTO-19", "Validacion de adjunto mayor a 5 MB", async () => {
    const adminPb = await createAdminClient();
    const customerSession = await loginViaApp(users.cliente.email, users.cliente.password);
    const supportDept = await adminPb.collection("departments").getFirstListItem('name = "Soporte TI"');
    const responseText = await submitNewTicketForm(customerSession.cookie, {
      attachments: createOversizedFile("qa-oversized.bin"),
      category: "software",
      departmentId: supportDept.id,
      description: "Ticket con adjunto demasiado grande para QA automatizada.",
      priority: "high",
      title: `QA 4.1 oversized ${Date.now()}`,
    });

    assertIncludes(responseText, "El archivo qa-oversized.bin supera el limite de 5 MB.", "No se mostro el error esperado para adjunto mayor a 5 MB.");

    return "La app bloquea adjuntos mayores a 5 MB con error controlado.";
  });

  await runCheck("QA-AUTO-20", "Notificaciones internas por comentario y cambio de estado", async () => {
    const adminPb = await createAdminClient();
    const ticket = await createResolvedTicket(adminPb, {
      title: `QA 4.2 notifications customer ${Date.now()}`,
    });
    const agentSession = await loginViaApp(users.agente.email, users.agente.password);
    const customerSession = await loginViaApp(users.cliente.email, users.cliente.password);
    const agentPath = `/app/agent/tickets/${ticket.id}`;

    await submitCommentForm(agentPath, agentSession.cookie, {
      content: "Comentario publico que debe notificar al cliente.",
      returnPath: agentPath,
      ticketId: ticket.id,
    });

    await submitStatusForm(agentPath, agentSession.cookie, {
      nextStatus: "resolved",
      resolutionNote: "Resolucion para validar notificacion por cambio de estado.",
      returnPath: agentPath,
      ticketId: ticket.id,
    });

    const customerWorkspace = await getPageWithCookie("/app/tickets", customerSession.cookie);

    assertIncludes(customerWorkspace, "Notificaciones", "El cliente no vio el panel de notificaciones.");
    assertIncludes(customerWorkspace, "Nuevo comentario", "El cliente no recibio notificacion por comentario publico.");
    assertIncludes(customerWorkspace, "Hay un comentario publico nuevo en uno de tus tickets.", "La notificacion por comentario publico no mostro el mensaje esperado.");
    assertIncludes(customerWorkspace, `/app/tickets/${ticket.id}`, "La notificacion del cliente no apunto al detalle correcto del ticket.");
    assertIncludes(customerWorkspace, "Cambio de estado", "El cliente no recibio notificacion por cambio de estado.");
    assertIncludes(customerWorkspace, "Tu ticket cambio a estado resolved.", "La notificacion de cambio de estado no mostro el mensaje esperado.");

    return `El cliente recibe notificaciones internas por comentario publico y resolucion sobre ${ticket.ticket_number}.`;
  });

  await runCheck("QA-AUTO-21", "Notificacion interna por reasignacion al agente destino", async () => {
    const adminPb = await createAdminClient();
    const ticket = await createResolvedTicket(adminPb, {
      title: `QA 4.2 notifications assignee ${Date.now()}`,
    });
    const supervisorSession = await loginViaApp(users.supervisor.email, users.supervisor.password);
    const agent2Session = await loginViaApp(users.agente2.email, users.agente2.password);
    const agent2 = await getUserByEmail(adminPb, users.agente2.email);
    const supervisorPath = `/app/supervisor/tickets/${ticket.id}`;

    await submitReassignForm(supervisorPath, supervisorSession.cookie, {
      assigneeId: agent2.id,
      returnPath: supervisorPath,
      ticketId: ticket.id,
    });

    const agentWorkspace = await getPageWithCookie("/app/agent/tickets", agent2Session.cookie);

    assertIncludes(agentWorkspace, "Nuevo ticket asignado", "El agente destino no recibio notificacion por reasignacion.");
    assertIncludes(agentWorkspace, "Se te asigno un ticket para seguimiento.", "La notificacion al agente destino no mostro el mensaje esperado.");
    assertIncludes(agentWorkspace, `/app/agent/tickets/${ticket.id}`, "La notificacion del agente destino no apunto al detalle correcto del ticket.");

    return `El agente destino recibe notificacion interna al reasignar ${ticket.ticket_number}.`;
  });

  await runCheck("QA-AUTO-22", "Notificacion revisada deja de verse en pendientes", async () => {
    const adminPb = await createAdminClient();
    const customerSession = await loginViaApp(users.cliente.email, users.cliente.password);
    const customer = await getUserByEmail(adminPb, users.cliente.email);

    const created = await adminPb.collection("notifications").create({
      created_at: nowIso(),
      created_ts: Date.now(),
      href: "/app/tickets",
      message: "Notificacion temporal para validar marcado como revisada.",
      read: false,
      ticket_id: null,
      title: "QA review notification",
      updated_at: nowIso(),
      user_id: customer.id,
    });

    const before = await getPageWithCookie("/app/tickets", customerSession.cookie);
    const formHtml = extractEnclosingForm(before, "Marcar revisada");

    assertIncludes(before, "QA review notification", "La notificacion pendiente no aparecio en el panel del cliente.");
    assertIncludes(before, "pendientes", "El panel no mostro el contador de pendientes.");

    await submitRenderedForm("/app/tickets", customerSession.cookie, formHtml, {
      notificationId: created.id,
    });

    const persisted = await adminPb.collection("notifications").getOne(created.id);
    const after = await getPageWithCookie("/app/tickets", customerSession.cookie);

    assert(persisted.read === true, "La notificacion no quedo marcada como revisada en persistencia.");
    assertExcludes(after, "QA review notification", "La notificacion revisada siguio visible en pendientes.");

    return "El panel permite marcar una notificacion como revisada y deja de mostrarla como pendiente.";
  });

  await runCheck("QA-AUTO-23", "Ticket cerrado no permite comentarios ni reasignacion", async () => {
    const adminPb = await createAdminClient();
    const agentSession = await loginViaApp(users.agente.email, users.agente.password);
    const supervisorSession = await loginViaApp(users.supervisor.email, users.supervisor.password);
    const customerSession = await loginViaApp(users.cliente.email, users.cliente.password);
    const ticket = await createClosedTicket(adminPb, {
      title: `QA closed final state ${Date.now()}`,
    });

    const agentDetail = await getPageWithCookie(`/app/agent/tickets/${ticket.id}`, agentSession.cookie);
    const supervisorDetail = await getPageWithCookie(`/app/supervisor/tickets/${ticket.id}`, supervisorSession.cookie);
    const customerDetail = await getPageWithCookie(`/app/tickets/${ticket.id}`, customerSession.cookie);

    assertIncludes(agentDetail, "Ya no permite reasignacion ni nuevas transiciones.", "La vista de agente no trato el ticket cerrado como estado final.");
    assertExcludes(agentDetail, "Reasignar ticket", "La vista de agente siguio mostrando reasignacion para ticket cerrado.");
    assertExcludes(agentDetail, "Cambiar estado", "La vista de agente siguio mostrando cambio de estado para ticket cerrado.");
    assertIncludes(agentDetail, "Ya no admite comentarios nuevos.", "La vista de agente siguio permitiendo comentar ticket cerrado.");
    assertIncludes(supervisorDetail, "Ya no permite reasignacion ni nuevas transiciones.", "La vista de supervisor no trato el ticket cerrado como estado final.");
    assertExcludes(supervisorDetail, "Reasignar ticket", "La vista de supervisor siguio mostrando reasignacion para ticket cerrado.");
    assertExcludes(supervisorDetail, "Cambiar estado", "La vista de supervisor siguio mostrando cambio de estado para ticket cerrado.");
    assertIncludes(supervisorDetail, "Ya no admite comentarios nuevos.", "La vista de supervisor siguio permitiendo comentar ticket cerrado.");
    assertIncludes(customerDetail, "Ya no admite comentarios nuevos.", "La vista de cliente siguio permitiendo comentar ticket cerrado.");

    return `El ticket ${ticket.ticket_number} se comporta como estado final cerrado en cliente, agente y supervisor.`;
  });

  await runCheck("QA-AUTO-24", "Autocierre de tickets resueltos vencidos", async () => {
    const adminPb = await createAdminClient();
    const customer = await getUserByEmail(adminPb, users.cliente.email);
    const agent = await getUserByEmail(adminPb, users.agente.email);
    const oldResolvedAt = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();
    const ticket = await createResolvedTicket(adminPb, {
      resolution_note: "Ticket resuelto pendiente de confirmacion para autocierre QA.",
      resolved_at: oldResolvedAt,
      title: `QA auto close ${Date.now()}`,
      updated_at: oldResolvedAt,
    });

    const { response } = await fetchText(`${appUrl}/api/health`);
    assert(response.ok, "La app no estaba disponible antes de ejecutar autocierre.");

    const result = spawnSync("npm", ["run", "tickets:auto-close"], {
      cwd: projectRoot,
      env: {
        ...process.env,
        AUTO_CLOSE_AFTER_HOURS: "48",
      },
      encoding: "utf8",
      shell: true,
    });

    assert(result.status === 0, `El script de autocierre fallo: ${result.stderr || result.stdout}`);

    const persisted = await adminPb.collection("tickets").getOne(ticket.id);
    const customerNotification = await adminPb.collection("notifications").getFirstListItem(`user_id = "${customer.id}" && ticket_id = "${ticket.id}" && title = "Ticket autocerrado"`);
    const agentNotification = await adminPb.collection("notifications").getFirstListItem(`user_id = "${agent.id}" && ticket_id = "${ticket.id}" && title = "Ticket autocerrado"`);

    assert(persisted.status === "closed", "El script de autocierre no llevo el ticket vencido a closed.");
    assert(persisted.close_reason === "sin_respuesta_cliente", "El autocierre no persistio el motivo esperado.");
    assert(typeof persisted.closed_at === "string" && persisted.closed_at.length > 0, "El autocierre no guardo closed_at.");
    assert(customerNotification.message.includes("se cerro automaticamente"), "El cliente no recibio notificacion de autocierre.");
    assert(agentNotification.message.includes("se cerro automaticamente"), "El agente no recibio notificacion de autocierre.");

    return `El ticket ${persisted.ticket_number} se autocerro por vencimiento con motivo sin_respuesta_cliente y notificaciones emitidas.`;
  });

  await runCheck("QA-AUTO-33", "Autocierre registra job run exitoso", async () => {
    const adminPb = await createAdminClient();
    const ticket = await createResolvedTicket(adminPb, {
      resolution_note: "Ticket resuelto para validacion de job run exitoso.",
      resolved_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
      title: `QA job run success ${Date.now()}`,
      updated_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    });
    const result = spawnSync("npm", ["run", "tickets:auto-close"], {
      cwd: projectRoot,
      env: {
        ...process.env,
        AUTO_CLOSE_AFTER_HOURS: "48",
        JOB_SOURCE: "qa",
      },
      encoding: "utf8",
      shell: true,
    });

    assert(result.status === 0, `El script de autocierre con job run fallo: ${result.stderr || result.stdout}`);
    const runOutput = extractJsonObjectFromOutput(result.stdout);
    assert(runOutput?.jobRunId, "El script de autocierre no devolvio jobRunId en la salida.");

    const jobRun = await adminPb.collection("job_runs").getOne(runOutput.jobRunId);
    const locks = await adminPb.collection("job_locks").getFullList({
      filter: 'job_name = "tickets:auto-close"',
    });
    const persisted = await adminPb.collection("tickets").getOne(ticket.id);

    assert(jobRun.status === "success", "La corrida de autocierre no quedo registrada como success.");
    assert(jobRun.closed_count >= 1, "La corrida de autocierre no registro cierres realizados.");
    assert(typeof jobRun.finished_at === "string" && jobRun.finished_at.length > 0, "La corrida de autocierre no guardo finished_at.");
    assert(locks.length === 0, "El lock del job no se libero tras la corrida exitosa.");
    assert(persisted.status === "closed", "El ticket de prueba no quedo autocerrado en la corrida exitosa.");

    return `El autocierre registro corrida success (${jobRun.id}) y libero el lock correctamente.`;
  });

  await runCheck("QA-AUTO-34", "Lock activo evita segunda corrida de autocierre", async () => {
    const adminPb = await createAdminClient();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);

    let lock;

    try {
      const existing = await adminPb.collection("job_locks").getFirstListItem('job_name = "tickets:auto-close"');
      lock = await adminPb.collection("job_locks").update(existing.id, {
        job_name: "tickets:auto-close",
        lock_expires_at: expiresAt.toISOString().replace("T", " "),
        locked_at: now.toISOString().replace("T", " "),
        locked_by: "qa-lock-test",
      });
    } catch {
      lock = await adminPb.collection("job_locks").create({
        job_name: "tickets:auto-close",
        lock_expires_at: expiresAt.toISOString().replace("T", " "),
        locked_at: now.toISOString().replace("T", " "),
        locked_by: "qa-lock-test",
      });
    }

    const result = spawnSync("npm", ["run", "tickets:auto-close"], {
      cwd: projectRoot,
      env: {
        ...process.env,
        AUTO_CLOSE_AFTER_HOURS: "48",
        JOB_SOURCE: "qa",
      },
      encoding: "utf8",
      shell: true,
    });

    assert(result.status === 0, `La corrida con lock activo devolvio error inesperado: ${result.stderr || result.stdout}`);
    const runOutput = extractJsonObjectFromOutput(result.stdout);
    assert(runOutput?.jobRunId, "La corrida omitida no devolvio jobRunId en la salida.");

    const skippedRun = await adminPb.collection("job_runs").getOne(runOutput.jobRunId);
    const persistedLock = await adminPb.collection("job_locks").getFirstListItem('job_name = "tickets:auto-close"');

    assert(skippedRun.error_summary.includes("Lock activo"), "La corrida omitida no registro el motivo de lock activo.");
    assert(persistedLock.locked_by === "qa-lock-test", "La corrida omitida modifico un lock activo que no debia tocar.");

    await adminPb.collection("job_locks").delete(lock.id);

    return `La segunda corrida quedo en skipped (${skippedRun.id}) al detectar lock activo.`;
  });

  await runCheck("QA-AUTO-35", "Dry run de autocierre no modifica tickets", async () => {
    const adminPb = await createAdminClient();
    const oldResolvedAt = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();
    const ticket = await createResolvedTicket(adminPb, {
      resolution_note: "Ticket resuelto para validacion dry-run.",
      resolved_at: oldResolvedAt,
      title: `QA dry run ${Date.now()}`,
      updated_at: oldResolvedAt,
    });
    const result = spawnSync("npm", ["run", "tickets:auto-close"], {
      cwd: projectRoot,
      env: {
        ...process.env,
        AUTO_CLOSE_AFTER_HOURS: "48",
        DRY_RUN: "1",
        JOB_SOURCE: "qa",
      },
      encoding: "utf8",
      shell: true,
    });

    assert(result.status === 0, `El dry-run de autocierre fallo: ${result.stderr || result.stdout}`);
    const runOutput = extractJsonObjectFromOutput(result.stdout);
    assert(runOutput?.jobRunId, "El dry-run no devolvio jobRunId en la salida.");

    const dryRun = await adminPb.collection("job_runs").getOne(runOutput.jobRunId);
    const persisted = await adminPb.collection("tickets").getOne(ticket.id);

    assert(dryRun.status === "success", "El dry-run no quedo registrado como success.");
    assert(dryRun.candidate_count >= 1, "El dry-run no detecto candidatos esperados.");
    assert(dryRun.closed_count === 0, "El dry-run reporto cierres reales cuando no debia hacerlo.");
    assert(persisted.status === "resolved", "El dry-run modifico el ticket cuando debia dejarlo en resolved.");
    assert(!persisted.closed_at, "El dry-run persistio closed_at cuando no debia hacerlo.");

    return `El dry-run registro corrida ${dryRun.id} sin modificar el ticket ${persisted.ticket_number}.`;
  });

  await runCheck("QA-AUTO-36", "Autocierre registra partial failure controlado", async () => {
    const adminPb = await createAdminClient();
    const oldResolvedAt = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();
    const failedTicket = await createResolvedTicket(adminPb, {
      resolution_note: "Ticket resuelto para validacion de partial failure.",
      resolved_at: oldResolvedAt,
      title: `QA partial fail target ${Date.now()}`,
      updated_at: oldResolvedAt,
    });
    const successfulTicket = await createResolvedTicket(adminPb, {
      resolution_note: "Segundo ticket resuelto para validar cierre parcial exitoso.",
      resolved_at: oldResolvedAt,
      title: `QA partial fail companion ${Date.now()}`,
      updated_at: oldResolvedAt,
    });
    const result = spawnSync("npm", ["run", "tickets:auto-close"], {
      cwd: projectRoot,
      env: {
        ...process.env,
        AUTO_CLOSE_AFTER_HOURS: "48",
        FORCE_FAIL_TICKET_ID: failedTicket.id,
        JOB_SOURCE: "qa",
      },
      encoding: "utf8",
      shell: true,
    });

    assert(result.status === 0, `La corrida con partial failure devolvio error inesperado: ${result.stderr || result.stdout}`);
    const runOutput = extractJsonObjectFromOutput(result.stdout);
    assert(runOutput?.jobRunId, "La corrida con partial failure no devolvio jobRunId en la salida.");

    const jobRun = await adminPb.collection("job_runs").getOne(runOutput.jobRunId);
    const persistedFailed = await adminPb.collection("tickets").getOne(failedTicket.id);
    const persistedSuccessful = await adminPb.collection("tickets").getOne(successfulTicket.id);

    assert(jobRun.status === "partial_failure", "La corrida no quedo registrada como partial_failure.");
    assert(jobRun.closed_count >= 1, "La corrida partial_failure no registro cierres exitosos parciales.");
    assert(jobRun.error_count >= 1, "La corrida partial_failure no registro errores.");
    assert(jobRun.error_summary.includes(failedTicket.ticket_number), "La corrida partial_failure no incluyo el ticket fallido en error_summary.");
    assert(persistedFailed.status === "resolved", "El ticket forzado a fallar no permanecio en resolved.");
    assert(persistedSuccessful.status === "closed", "El ticket acompanante no se cerro durante la corrida parcial.");

    return `La corrida ${jobRun.id} quedo en partial_failure, mantuvo ${persistedFailed.ticket_number} en resolved y cerro ${persistedSuccessful.ticket_number}.`;
  });

  await runCheck("QA-AUTO-37", "Health endpoint con dependencia real de PocketBase", async () => {
    const autoCloseResult = spawnSync("npm", ["run", "tickets:auto-close"], {
      cwd: projectRoot,
      env: {
        ...process.env,
        AUTO_CLOSE_AFTER_HOURS: "48",
        DRY_RUN: "1",
        JOB_SOURCE: "qa",
      },
      encoding: "utf8",
      shell: true,
    });

    assert(autoCloseResult.status === 0, `No se pudo preparar senal de job en health: ${autoCloseResult.stderr || autoCloseResult.stdout}`);

    const response = await fetch(`${appUrl}/api/health`);
    const json = await response.json();

    assert(response.ok, `El health check operativo devolvio ${response.status}.`);
    assert(json.ok === true, "El health check operativo no devolvio ok=true.");
    assert(json.dependencies?.pocketbase?.ok === true, "El health check operativo no reflejo PocketBase en estado OK.");
    assert(json.dependencies?.jobs?.autoClose, "El health check operativo no devolvio resumen del ultimo job de autocierre.");
    assert(typeof json.dependencies.jobs.autoClose.status === "string" && json.dependencies.jobs.autoClose.status.length > 0, "El health check operativo no devolvio status del ultimo job de autocierre.");
    assert(typeof json.dependencies.jobs.autoClose.ok === "boolean", "El health check operativo no devolvio bandera ok del ultimo job de autocierre.");
    assert(typeof json.correlationId === "string" && json.correlationId.length > 0, "El health check operativo no devolvio correlationId.");
    assert(typeof json.responseTimeMs === "number" && json.responseTimeMs >= 0, "El health check operativo no devolvio responseTimeMs valido.");
    assert(typeof json.timestamp === "string" && json.timestamp.length > 0, "El health check operativo no devolvio timestamp.");

    return "`/api/health` refleja dependencia PocketBase y tiempo de respuesta operativo.";
  });

  await runCheck("QA-AUTO-38", "Exportaciones supervisor con logging operativo", async () => {
    const supervisorSession = await loginViaApp(users.supervisor.email, users.supervisor.password);
    const csvResponse = await fetch(`${appUrl}/app/supervisor/exports/tickets`, {
      headers: {
        cookie: supervisorSession.cookie,
      },
    });
    const metricsResponse = await fetch(`${appUrl}/app/supervisor/exports/metrics`, {
      headers: {
        cookie: supervisorSession.cookie,
      },
    });
    const summaryResponse = await fetch(`${appUrl}/app/supervisor/exports/summary`, {
      headers: {
        cookie: supervisorSession.cookie,
      },
    });

    assert(csvResponse.ok, `La exportacion CSV devolvio ${csvResponse.status} tras agregar logging operativo.`);
    assert(metricsResponse.ok, `La exportacion JSON devolvio ${metricsResponse.status} tras agregar logging operativo.`);
    assert(summaryResponse.ok, `La exportacion Markdown devolvio ${summaryResponse.status} tras agregar logging operativo.`);

    return "Las exportaciones supervisor siguen respondiendo correctamente tras agregar logging operativo estructurado.";
  });

  await runCheck("QA-AUTO-41", "Cliente bloqueado en paginas supervisor", async () => {
    const customerSession = await loginViaApp(users.cliente.email, users.cliente.password);
    const dashboard = await fetch(`${appUrl}/app/supervisor/dashboard`, {
      headers: { cookie: customerSession.cookie },
      redirect: "manual",
    });
    const tickets = await fetch(`${appUrl}/app/supervisor/tickets`, {
      headers: { cookie: customerSession.cookie },
      redirect: "manual",
    });
    const usersPage = await fetch(`${appUrl}/app/supervisor/users`, {
      headers: { cookie: customerSession.cookie },
      redirect: "manual",
    });
    const departments = await fetch(`${appUrl}/app/supervisor/departments`, {
      headers: { cookie: customerSession.cookie },
      redirect: "manual",
    });

    assert([302, 307].includes(dashboard.status), `El cliente no fue redirigido al bloquear dashboard supervisor: ${dashboard.status}.`);
    assert([302, 307].includes(tickets.status), `El cliente no fue redirigido al bloquear tickets supervisor: ${tickets.status}.`);
    assert([302, 307].includes(usersPage.status), `El cliente no fue redirigido al bloquear users supervisor: ${usersPage.status}.`);
    assert([302, 307].includes(departments.status), `El cliente no fue redirigido al bloquear departments supervisor: ${departments.status}.`);

    return "El cliente no accede a paginas supervisor por URL directa y es redirigido fuera de ese contexto.";
  });

  await runCheck("QA-AUTO-42", "Agente bloqueado en paginas supervisor", async () => {
    const agentSession = await loginViaApp(users.agente.email, users.agente.password);
    const dashboard = await fetch(`${appUrl}/app/supervisor/dashboard`, {
      headers: { cookie: agentSession.cookie },
      redirect: "manual",
    });
    const tickets = await fetch(`${appUrl}/app/supervisor/tickets`, {
      headers: { cookie: agentSession.cookie },
      redirect: "manual",
    });
    const usersPage = await fetch(`${appUrl}/app/supervisor/users`, {
      headers: { cookie: agentSession.cookie },
      redirect: "manual",
    });
    const departments = await fetch(`${appUrl}/app/supervisor/departments`, {
      headers: { cookie: agentSession.cookie },
      redirect: "manual",
    });

    assert([302, 307].includes(dashboard.status), `El agente no fue redirigido al bloquear dashboard supervisor: ${dashboard.status}.`);
    assert([302, 307].includes(tickets.status), `El agente no fue redirigido al bloquear tickets supervisor: ${tickets.status}.`);
    assert([302, 307].includes(usersPage.status), `El agente no fue redirigido al bloquear users supervisor: ${usersPage.status}.`);
    assert([302, 307].includes(departments.status), `El agente no fue redirigido al bloquear departments supervisor: ${departments.status}.`);

    return "El agente no accede a paginas supervisor por URL directa y es redirigido fuera de ese contexto.";
  });

  await runCheck("QA-AUTO-43", "Exports supervisor bloqueados para roles no autorizados", async () => {
    const customerSession = await loginViaApp(users.cliente.email, users.cliente.password);
    const agentSession = await loginViaApp(users.agente.email, users.agente.password);
    const paths = [
      "/app/supervisor/exports/tickets",
      "/app/supervisor/exports/metrics",
      "/app/supervisor/exports/summary",
    ];

    for (const pagePath of paths) {
      const customerResponse = await fetch(`${appUrl}${pagePath}`, {
        headers: { cookie: customerSession.cookie },
        redirect: "manual",
      });
      const agentResponse = await fetch(`${appUrl}${pagePath}`, {
        headers: { cookie: agentSession.cookie },
        redirect: "manual",
      });

      assert(customerResponse.status === 403, `La ruta ${pagePath} no devolvio 403 para cliente.`);
      assert(agentResponse.status === 403, `La ruta ${pagePath} no devolvio 403 para agente.`);
    }

    return "Los exports supervisor responden 403 para cliente y agente sin permisos.";
  });

  await runCheck("QA-AUTO-44", "Accion de notificacion no modifica recurso ajeno", async () => {
    const adminPb = await createAdminClient();
    const agentSession = await loginViaApp(users.agente.email, users.agente.password);
    const timestamp = new Date().toISOString();
    const customer = await getUserByEmail(adminPb, users.cliente.email);
    const agent = await getUserByEmail(adminPb, users.agente.email);
    const notification = await adminPb.collection("notifications").create({
      created_at: timestamp,
      created_ts: Date.now(),
      href: "/app/tickets",
      message: "Notificacion QA propiedad cliente.",
      read: false,
      title: "QA notification ownership",
      updated_at: timestamp,
      user_id: customer.id,
    });

    const response = await fetch(`${appUrl}/app`, {
      body: new URLSearchParams({ notificationId: notification.id }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        cookie: agentSession.cookie,
      },
      method: "POST",
    });

    assert(response.ok, `La invocacion indirecta de markNotificationReadAction devolvio ${response.status}.`);

    const persisted = await adminPb.collection("notifications").getOne(notification.id);

    assert(persisted.user_id === customer.id, "La notificacion ya no pertenece al usuario esperado despues del intento cruzado.");
    assert(persisted.read === false, "La accion permitio marcar como leida una notificacion ajena.");
    assert(agent.id !== customer.id, "El dataset QA uso usuarios iguales para validar propiedad de notificacion.");

    return "La accion de notificacion ignoro un notificationId ajeno y no altero el registro del cliente.";
  });

  await runCheck("QA-AUTO-45", "Backup local de PocketBase", async () => {
    const result = runScript("pb:backup");

    assert(result.status === 0, `El backup local de PocketBase fallo: ${result.stderr || result.stdout}`);

    const payload = extractJsonObjectFromOutput(result.stdout);

    assert(payload?.backupPath, "El backup local no devolvio backupPath.");
    assert(payload.files?.dataDb === true, "El backup local no incluyo data.db.");
    assert(payload.files?.auxiliaryDb === true, "El backup local no incluyo auxiliary.db.");
    assert(payload.files?.storageDir === true, "El backup local no incluyo storage/.");

    return `El backup local genero respaldo valido en ${payload.backupPath}.`;
  });

  await runCheck("QA-AUTO-46", "Restore check sin mutacion", async () => {
    const backupResult = runScript("pb:backup");
    assert(backupResult.status === 0, `No se pudo preparar respaldo para restore-check: ${backupResult.stderr || backupResult.stdout}`);
    const backupPayload = extractJsonObjectFromOutput(backupResult.stdout);
    const checkResult = runScript("pb:restore:check", {
      PB_RESTORE_BACKUP_PATH: backupPayload.backupPath,
    });

    assert(checkResult.status === 0, `El restore-check fallo: ${checkResult.stderr || checkResult.stdout}`);

    const payload = extractJsonObjectFromOutput(checkResult.stdout);

    assert(payload?.ok === true, "El restore-check no devolvio ok=true.");
    assert(payload?.mode === "check-only", "El restore-check no se ejecuto en modo check-only.");
    assert(payload?.backupPath === backupPayload.backupPath, "El restore-check no valido el respaldo esperado.");

    return `El restore-check valido correctamente el respaldo ${payload.backupPath} sin mutar datos activos.`;
  });

  await runCheck("QA-AUTO-47", "Restore protegido contra ejecucion accidental", async () => {
    const backupResult = runScript("pb:backup");
    assert(backupResult.status === 0, `No se pudo preparar respaldo para restore protegido: ${backupResult.stderr || backupResult.stdout}`);
    const backupPayload = extractJsonObjectFromOutput(backupResult.stdout);
    const restoreResult = runScript("pb:restore", {
      PB_RESTORE_BACKUP_PATH: backupPayload.backupPath,
    });

    assert(restoreResult.status === 0, `El restore protegido devolvio error inesperado: ${restoreResult.stderr || restoreResult.stdout}`);

    const payload = extractJsonObjectFromOutput(restoreResult.stdout);

    assert(payload?.ok === true, "El restore protegido no devolvio ok=true.");
    assert(payload?.snapshotCreated === false, "El restore protegido no debio crear snapshot sin confirmacion explicita.");
    assert(
      typeof payload?.message === "string" && payload.message.includes("PB_RESTORE_APPLY=1"),
      "El restore protegido no devolvio mensaje claro de confirmacion requerida.",
    );

    return "El restore de PocketBase no se aplica accidentalmente sin PB_RESTORE_APPLY=1.";
  });

  await runCheck("QA-AUTO-48", "Navegacion auth enriquecida", async () => {
    const loginResult = await fetchTextWithRetry(`${appUrl}/login`);
    const registerResult = await fetchTextWithRetry(`${appUrl}/register`);
    const forgotPasswordResult = await fetchTextWithRetry(`${appUrl}/forgot-password`);

    assert(loginResult.response.ok, `GET /login devolvio ${loginResult.response.status}.`);
    assert(registerResult.response.ok, `GET /register devolvio ${registerResult.response.status}.`);
    assert(forgotPasswordResult.response.ok, `GET /forgot-password devolvio ${forgotPasswordResult.response.status}.`);

    assertIncludes(loginResult.text, "Olvide mi password", "La pantalla de login no mostro acceso a recuperacion de password.");
    assertIncludes(loginResult.text, "Registrate aqui", "La pantalla de login no mostro acceso a registro.");
    assertIncludes(registerResult.text, "Inicia sesion aqui", "La pantalla de registro no mostro acceso de regreso a login.");
    assertIncludes(forgotPasswordResult.text, "Recuperar password", "La pantalla forgot-password no renderizo correctamente.");

    return "Login, register y forgot-password exponen la navegacion publica esperada.";
  });

  await runCheck("QA-AUTO-49", "Solicitud de recuperacion de password", async () => {
    const { response, text } = await fetchTextWithRetry(`${appUrl}/api/auth/forgot-password`, {
      body: JSON.stringify({ email: users.cliente.email }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    const json = JSON.parse(text);

    assert(response.ok, `La solicitud de recuperacion devolvio ${response.status}.`);
    assert(
      typeof json.message === "string" && json.message.includes("PocketBase procesara la solicitud"),
      "La solicitud de recuperacion no devolvio el mensaje controlado esperado.",
    );

    return "La solicitud de recuperacion de password se procesa con respuesta controlada.";
  });

  await runCheck("QA-AUTO-25", "Exportacion CSV de tickets para supervisor", async () => {
    const supervisorSession = await loginViaApp(users.supervisor.email, users.supervisor.password);
    const dashboard = await getPageWithCookie("/app/supervisor/dashboard", supervisorSession.cookie);
    const { response, text } = await fetchText(`${appUrl}/app/supervisor/exports/tickets`, {
      headers: {
        cookie: supervisorSession.cookie,
      },
    });

    assertIncludes(dashboard, "Exportar tickets CSV", "El dashboard de supervisor no mostro el acceso a exportacion CSV.");
    assert(response.ok, `La exportacion CSV devolvio ${response.status}.`);
    assert((response.headers.get("content-type") || "").includes("text/csv"), "La exportacion de tickets no devolvio content-type CSV.");
    assertIncludes(response.headers.get("content-disposition") || "", "tickets-export", "La exportacion CSV no devolvio nombre de archivo esperado.");
    assertIncludes(text, '"ticket_number","status","priority","category"', "El CSV no contiene encabezado esperado de tickets.");
    assertIncludes(text, "TKT-", "El CSV no contiene tickets exportados.");

    return "Supervisor descarga exportacion CSV de tickets con encabezado y contenido real.";
  });

  await runCheck("QA-AUTO-26", "Exportacion JSON de metricas para supervisor", async () => {
    const supervisorSession = await loginViaApp(users.supervisor.email, users.supervisor.password);
    const dashboard = await getPageWithCookie("/app/supervisor/dashboard", supervisorSession.cookie);
    const response = await fetch(`${appUrl}/app/supervisor/exports/metrics`, {
      headers: {
        cookie: supervisorSession.cookie,
      },
    });
    const json = await response.json();

    assertIncludes(dashboard, "Descargar metricas JSON", "El dashboard de supervisor no mostro el acceso a metricas JSON.");
    assert(response.ok, `La exportacion JSON devolvio ${response.status}.`);
    assert((response.headers.get("content-type") || "").includes("application/json"), "La exportacion de metricas no devolvio JSON.");
    assert(typeof json.generatedAt === "string" && json.generatedAt.length > 0, "La exportacion JSON no incluyo generatedAt.");
    assert(typeof json.counts?.totalTickets === "number", "La exportacion JSON no incluyo counts.totalTickets.");
    assert(Array.isArray(json.agedTickets), "La exportacion JSON no incluyo agedTickets como arreglo.");

    return "Supervisor descarga metricas JSON con counts, agedTickets y marca temporal de generacion.";
  });

  await runCheck("QA-AUTO-27", "Exportacion CSV filtrada para supervisor", async () => {
    const supervisorSession = await loginViaApp(users.supervisor.email, users.supervisor.password);
    const query = "status=closed&priority=high&q=TKT-1003";
    const page = await getPageWithCookie(`/app/supervisor/tickets?${query}`, supervisorSession.cookie);
    const { response, text } = await fetchText(`${appUrl}/app/supervisor/exports/tickets?${query}`, {
      headers: {
        cookie: supervisorSession.cookie,
      },
    });
    const rows = text.trim().split("\n").slice(1).filter(Boolean);

    assertIncludes(page, "Exportar CSV filtrado", "La vista global de supervisor no mostro el acceso a exportacion CSV filtrada.");
    assert(response.ok, `La exportacion CSV filtrada devolvio ${response.status}.`);
    assertIncludes(response.headers.get("content-disposition") || "", "status-closed-priority-high-search", "El nombre del archivo no reflejo el contexto de filtros activos.");
    assert(rows.length > 0, "La exportacion filtrada no devolvio filas de tickets cuando debia haber coincidencias.");
    assert(rows.every((row) => row.includes('"closed"') && row.includes('"high"') && row.includes('"TKT-1003')), "El CSV filtrado incluyo filas fuera de los filtros activos esperados.");

    return "Supervisor exporta CSV filtrado y el archivo respeta status, priority y q activos.";
  });

  await runCheck("QA-AUTO-28", "Exportacion CSV filtrada avanzada para supervisor", async () => {
    const adminPb = await createAdminClient();
    const supervisorSession = await loginViaApp(users.supervisor.email, users.supervisor.password);
    const supportDept = await adminPb.collection("departments").getFirstListItem('name = "Soporte TI"');
    const agent = await getUserByEmail(adminPb, users.agente.email);
    const query = new URLSearchParams({
      assignedToId: agent.id,
      createdFrom: "2026-04-01",
      createdTo: "2026-04-01",
      departmentId: supportDept.id,
    }).toString();
    const page = await getPageWithCookie(`/app/supervisor/tickets?${query}`, supervisorSession.cookie);
    const { response, text } = await fetchText(`${appUrl}/app/supervisor/exports/tickets?${query}`, {
      headers: {
        cookie: supervisorSession.cookie,
      },
    });
    const rows = text.trim().split("\n").slice(1).filter(Boolean);

    assertIncludes(page, "Todos los departamentos", "La vista global de supervisor no mostro el filtro por departamento.");
    assertIncludes(page, "Todos los agentes asignados", "La vista global de supervisor no mostro el filtro por agente asignado.");
    assertIncludes(page, "Exportar CSV filtrado", "La vista global de supervisor no mostro el acceso a exportacion CSV filtrada.");
    assert(response.ok, `La exportacion CSV filtrada avanzada devolvio ${response.status}.`);
    assertIncludes(
      response.headers.get("content-disposition") || "",
      "department-assigned-date-range",
      "El nombre del archivo no reflejo el contexto de filtros avanzados.",
    );
    assert(rows.length > 0, "La exportacion filtrada avanzada no devolvio filas cuando debia haber coincidencias.");
    assert(
      rows.every(
        (row) =>
          row.includes('"TKT-00001"') &&
          row.includes('"Soporte TI"') &&
          row.includes('"ana.agente@techsupport.local"') &&
          row.includes('"2026-04-01 08:30:00.000Z"'),
      ),
      "El CSV filtrado avanzado incluyo filas fuera del departamento, agente asignado o rango de fechas esperado.",
    );

    return "Supervisor exporta CSV filtrado y el archivo respeta departamento, agente asignado y rango de fechas activos.";
  });

  await runCheck("QA-AUTO-29", "Dashboard de supervisor con KPI ampliado", async () => {
    const adminPb = await createAdminClient();
    const expected = await computeExpectedDashboardMetrics(adminPb);
    const supervisorSession = await loginViaApp(users.supervisor.email, users.supervisor.password);
    const dashboard = await getPageWithCookie("/app/supervisor/dashboard", supervisorSession.cookie);

    assertIncludes(dashboard, "Tasa de reapertura", "El dashboard no mostro la tarjeta de tasa de reapertura.");
    assertIncludes(dashboard, "Tiempo promedio hasta resolved", "El dashboard no mostro el KPI de tiempo hasta resolved.");
    assertIncludes(dashboard, "Tiempo promedio hasta closed", "El dashboard no mostro el KPI de tiempo hasta closed.");
    assertIncludes(dashboard, `${expected.reopenedRatePercent}%`, "El dashboard no mostro la tasa de reapertura esperada segun el dataset actual.");
    assertIncludes(
      dashboard,
      expected.averageTimeToResolvedHours === null ? "N/D" : `${expected.averageTimeToResolvedHours} h`,
      "El dashboard no mostro el tiempo promedio hasta resolved esperado segun el dataset actual.",
    );
    assertIncludes(
      dashboard,
      expected.averageTimeToClosedHours === null ? "N/D" : `${expected.averageTimeToClosedHours} h`,
      "El dashboard no mostro el tiempo promedio hasta closed esperado segun el dataset actual.",
    );
    assertIncludes(dashboard, "Backlog envejecido por estado", "El dashboard no mostro el desglose de backlog envejecido por estado.");
    assertIncludes(dashboard, "Backlog envejecido por departamento", "El dashboard no mostro el desglose de backlog envejecido por departamento.");

    for (const item of expected.agedTicketsByStatus) {
      assertIncludes(dashboard, item.label, `El dashboard no mostro ${item.label} dentro del backlog envejecido por estado.`);
    }

    for (const item of expected.agedTicketsByDepartment) {
      assertIncludes(dashboard, item.label, `El dashboard no mostro ${item.label} dentro del backlog envejecido por departamento.`);
    }

    return "Dashboard supervisor muestra tasa de reapertura, tiempos separados y desglose de backlog envejecido con valores esperados.";
  });

  await runCheck("QA-AUTO-30", "Exportacion JSON de metricas ampliadas para supervisor", async () => {
    const adminPb = await createAdminClient();
    const expected = await computeExpectedDashboardMetrics(adminPb);
    const supervisorSession = await loginViaApp(users.supervisor.email, users.supervisor.password);
    const response = await fetch(`${appUrl}/app/supervisor/exports/metrics`, {
      headers: {
        cookie: supervisorSession.cookie,
      },
    });
    const json = await response.json();

    assert(response.ok, `La exportacion JSON ampliada devolvio ${response.status}.`);
    assert(json.reopenedRatePercent === expected.reopenedRatePercent, "La exportacion JSON no devolvio reopenedRatePercent esperado segun el dataset actual.");
    assert(json.averageTimeToResolvedHours === expected.averageTimeToResolvedHours, "La exportacion JSON no devolvio averageTimeToResolvedHours esperado segun el dataset actual.");
    assert(json.averageTimeToClosedHours === expected.averageTimeToClosedHours, "La exportacion JSON no devolvio averageTimeToClosedHours esperado segun el dataset actual.");
    assert(Array.isArray(json.agedTicketsByStatus), "La exportacion JSON no incluyo agedTicketsByStatus como arreglo.");
    assert(Array.isArray(json.agedTicketsByDepartment), "La exportacion JSON no incluyo agedTicketsByDepartment como arreglo.");

    for (const item of expected.agedTicketsByStatus) {
      assert(
        json.agedTicketsByStatus.some((jsonItem) => jsonItem.label === item.label && jsonItem.count === item.count),
        `La exportacion JSON no devolvio el backlog envejecido esperado para estado ${item.label}.`,
      );
    }

    for (const item of expected.agedTicketsByDepartment) {
      assert(
        json.agedTicketsByDepartment.some((jsonItem) => jsonItem.label === item.label && jsonItem.count === item.count),
        `La exportacion JSON no devolvio el backlog envejecido esperado para departamento ${item.label}.`,
      );
    }

    return "Supervisor descarga metricas JSON ampliadas con tasa de reapertura, tiempos separados y backlog envejecido desglosado.";
  });

  await runCheck("QA-AUTO-31", "Dashboard de supervisor con resumen ejecutivo", async () => {
    const supervisorSession = await loginViaApp(users.supervisor.email, users.supervisor.password);
    const dashboard = await getPageWithCookie("/app/supervisor/dashboard", supervisorSession.cookie);

    assertIncludes(dashboard, "Resumen ejecutivo", "El dashboard no mostro el bloque de resumen ejecutivo.");
    assertIncludes(dashboard, "Lectura gerencial del periodo", "El dashboard no mostro el titulo del resumen gerencial.");
    assertIncludes(dashboard, "Highlights", "El dashboard no mostro la seccion de highlights ejecutivos.");
    assertIncludes(dashboard, "Focos operativos", "El dashboard no mostro la seccion de focos operativos.");
    assertIncludes(dashboard, "Descargar resumen gerencial", "El dashboard no mostro el acceso a la descarga gerencial.");

    return "Dashboard supervisor muestra bloque de resumen ejecutivo con highlights, focos operativos y acceso de descarga.";
  });

  await runCheck("QA-AUTO-32", "Exportacion Markdown de resumen gerencial", async () => {
    const supervisorSession = await loginViaApp(users.supervisor.email, users.supervisor.password);
    const { response, text } = await fetchText(`${appUrl}/app/supervisor/exports/summary`, {
      headers: {
        cookie: supervisorSession.cookie,
      },
    });

    assert(response.ok, `La exportacion Markdown gerencial devolvio ${response.status}.`);
    assert((response.headers.get("content-type") || "").includes("text/markdown"), "La exportacion gerencial no devolvio Markdown.");
    assertIncludes(response.headers.get("content-disposition") || "", "managerial-summary", "La exportacion gerencial no devolvio nombre de archivo esperado.");
    assertIncludes(text, "# Resumen gerencial semanal", "La exportacion gerencial no incluyo el encabezado esperado.");
    assertIncludes(text, "## Lectura ejecutiva", "La exportacion gerencial no incluyo la lectura ejecutiva.");
    assertIncludes(text, "## Highlights", "La exportacion gerencial no incluyo highlights.");
    assertIncludes(text, "## Focos operativos", "La exportacion gerencial no incluyo focos operativos.");
    assertIncludes(text, "Tasa de reapertura:", "La exportacion gerencial no incluyo el KPI de tasa de reapertura.");

    return "Supervisor descarga resumen gerencial en Markdown con encabezado, KPIs principales, highlights y focos operativos.";
  });

  await runCheck("QA-AUTO-08", "Cliente confirma cierre de ticket resuelto", async () => {
    const adminPb = await createAdminClient();
    const customerSession = await loginViaApp(users.cliente.email, users.cliente.password);
    const ticket = await createResolvedTicket(adminPb);
    const detailBefore = await getPageWithCookie(`/app/tickets/${ticket.id}`, customerSession.cookie);
    const responseText = await submitCustomerResolutionForm(`/app/tickets/${ticket.id}`, customerSession.cookie, {
      closeReason: "solucion_aplicada",
      decision: "close",
      returnPath: `/app/tickets/${ticket.id}`,
      ticketId: ticket.id,
    });

    const persisted = await adminPb.collection("tickets").getOne(ticket.id);
    assertIncludes(detailBefore, "Respuesta del cliente sobre ticket resuelto", "El cliente no vio el formulario para responder un ticket resuelto.");
    assertExcludes(responseText, "No fue posible responder el ticket resuelto.", "La respuesta del cliente al confirmar cierre devolvio error inesperado.");
    assert(persisted.status === "closed", "El cliente no pudo cerrar el ticket resuelto en persistencia.");
    assert(typeof persisted.closed_at === "string" && persisted.closed_at.length > 0, "El cierre confirmado por cliente no guardo closed_at.");

    return `Cliente confirmo cierre de ${persisted.ticket_number} con closed_at persistido.`;
  });

  await runCheck("QA-AUTO-09", "Cliente solicita reapertura de ticket resuelto", async () => {
    const adminPb = await createAdminClient();
    const customerSession = await loginViaApp(users.cliente.email, users.cliente.password);
    const ticket = await createResolvedTicket(adminPb, {
      title: `QA resolved customer reopen ${Date.now()}`,
    });
    const responseText = await submitCustomerResolutionForm(`/app/tickets/${ticket.id}`, customerSession.cookie, {
      decision: "reopen",
      reopenReason: "problema_persistente",
      returnPath: `/app/tickets/${ticket.id}`,
      ticketId: ticket.id,
    });

    const persisted = await adminPb.collection("tickets").getOne(ticket.id);
    assertExcludes(responseText, "No fue posible responder el ticket resuelto.", "La respuesta del cliente al solicitar reapertura devolvio error inesperado.");
    assert(persisted.status === "reopened", "La solicitud de reapertura del cliente no persistio reopened.");
    assert(persisted.reopen_reason === "problema_persistente", "La solicitud de reapertura del cliente no persistio reopen_reason.");

    return `Cliente solicito reapertura de ${persisted.ticket_number} con motivo persistido.`;
  });

  const reportPath = await writeReport();
  const failed = results.some((result) => result.status !== "OK");

  console.log(`Reporte generado en: ${reportPath}`);

  if (failed) {
    process.exitCode = 1;
  }
}

main().catch(async (error) => {
  addResult("QA-AUTO-UNCAUGHT", "Error no controlado", "FALLO", error instanceof Error ? error.message : String(error));
  const reportPath = await writeReport();
  console.error(`Reporte generado en: ${reportPath}`);
  console.error(error);
  process.exit(1);
});
