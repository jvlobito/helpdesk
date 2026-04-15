import fs from "node:fs";
import path from "node:path";

import PocketBase from "pocketbase";

const projectRoot = process.cwd();
const envFile = path.join(projectRoot, ".env.local");

function loadEnv(filePath) {
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

if (!fs.existsSync(envFile)) {
  throw new Error("No existe .env.local. Crea el archivo antes de bootstrapear PocketBase.");
}

loadEnv(envFile);

const baseUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL ?? "http://127.0.0.1:8090";
const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;

if (!adminEmail || !adminPassword) {
  throw new Error("Faltan POCKETBASE_ADMIN_EMAIL o POCKETBASE_ADMIN_PASSWORD en .env.local.");
}

const pb = new PocketBase(baseUrl);
pb.autoCancellation(false);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function removeSystemFields(fields) {
  return fields.filter((field) => !field.system);
}

function textField(name, options = {}) {
  return {
    hidden: false,
    max: options.max ?? 0,
    min: options.min ?? 0,
    name,
    pattern: options.pattern ?? "",
    presentable: false,
    primaryKey: false,
    required: options.required ?? false,
    system: false,
    type: "text",
  };
}

function emailField(name, options = {}) {
  return {
    exceptDomains: null,
    hidden: false,
    name,
    onlyDomains: null,
    presentable: false,
    required: options.required ?? false,
    system: false,
    type: "email",
  };
}

function boolField(name) {
  return {
    hidden: false,
    name,
    presentable: false,
    required: false,
    system: false,
    type: "bool",
  };
}

function selectField(name, values, options = {}) {
  return {
    hidden: false,
    maxSelect: options.maxSelect ?? 1,
    name,
    presentable: false,
    required: options.required ?? false,
    system: false,
    type: "select",
    values,
  };
}

function relationField(name, collectionId, options = {}) {
  return {
    cascadeDelete: options.cascadeDelete ?? false,
    collectionId,
    hidden: false,
    maxSelect: options.maxSelect ?? 1,
    minSelect: options.minSelect ?? 0,
    name,
    presentable: false,
    required: options.required ?? false,
    system: false,
    type: "relation",
  };
}

function dateField(name, options = {}) {
  return {
    hidden: false,
    max: "",
    min: "",
    name,
    presentable: false,
    required: options.required ?? false,
    system: false,
    type: "date",
  };
}

function fileField(name, options = {}) {
  return {
    hidden: false,
    maxSelect: options.maxSelect ?? 1,
    maxSize: options.maxSize ?? 5242880,
    mimeTypes: options.mimeTypes ?? [],
    name,
    presentable: false,
    protected: options.protected ?? false,
    required: options.required ?? false,
    system: false,
    thumbs: options.thumbs ?? [],
    type: "file",
  };
}

function numberField(name, options = {}) {
  return {
    hidden: false,
    max: options.max ?? null,
    min: options.min ?? null,
    name,
    noDecimal: options.noDecimal ?? true,
    presentable: false,
    required: options.required ?? false,
    system: false,
    type: "number",
  };
}

async function authenticateSuperuser() {
  await pb.collection("_superusers").authWithPassword(adminEmail, adminPassword);
}

async function getScaffolds() {
  return pb.collections.getScaffolds();
}

function mergeFields(existingFields, additionalFields) {
  const byName = new Map(existingFields.map((field) => [field.name, field]));

  for (const field of additionalFields) {
    const previous = byName.get(field.name) ?? {};
    byName.set(field.name, { ...previous, ...field });
  }

  return Array.from(byName.values());
}

async function upsertCollectionByName(name, factory) {
  let existing = null;

  try {
    existing = await pb.collections.getOne(name);
  } catch (error) {
    if (error?.status !== 404) {
      throw error;
    }
  }

  if (existing) {
    return existing.id;
  }

  const collection = await factory();

  try {
    const created = await pb.collections.create(collection);
    return created.id;
  } catch (error) {
    throw error;
  }
}

async function findCollectionId(name) {
  const collection = await pb.collections.getOne(name);
  return collection.id;
}

async function upsertAuthRecord(collectionName, email, data) {
  try {
    const existing = await pb.collection(collectionName).getFirstListItem(`email = "${email}"`);
    await pb.collection(collectionName).update(existing.id, {
      ...data,
      email,
      password: data.password,
      passwordConfirm: data.password,
    });
    return existing.id;
  } catch {
    const created = await pb.collection(collectionName).create({
      ...data,
      email,
      password: data.password,
      passwordConfirm: data.password,
    });
    return created.id;
  }
}

async function upsertRecord(collectionName, filter, data) {
  try {
    const existing = await pb.collection(collectionName).getFirstListItem(filter);
    await pb.collection(collectionName).update(existing.id, data);
    return existing.id;
  } catch {
    const created = await pb.collection(collectionName).create(data);
    return created.id;
  }
}

async function ensureCollections() {
  const scaffolds = await getScaffolds();

  try {
    const existingUsers = await pb.collections.getOne("users");
    existingUsers.listRule = '@request.auth.role = "supervisor"';
    existingUsers.viewRule = '@request.auth.id != ""';
    existingUsers.createRule = "";
    existingUsers.updateRule = 'id = @request.auth.id || @request.auth.role = "supervisor"';
    existingUsers.deleteRule = '@request.auth.role = "supervisor"';
    existingUsers.authRule = 'active = true';
    existingUsers.manageRule = '@request.auth.role = "supervisor"';
    existingUsers.fields = mergeFields(existingUsers.fields, [
      textField("first_name", { required: true }),
      textField("last_name", { required: true }),
      selectField("role", ["cliente", "agente", "supervisor"], { required: true }),
      textField("department_id"),
      boolField("active"),
    ]);
    await pb.collections.update(existingUsers.id, existingUsers);
  } catch {
    const collection = clone(scaffolds.auth);
    collection.name = "users";
    collection.listRule = '@request.auth.role = "supervisor"';
    collection.viewRule = '@request.auth.id != ""';
    collection.createRule = "";
    collection.updateRule = 'id = @request.auth.id || @request.auth.role = "supervisor"';
    collection.deleteRule = '@request.auth.role = "supervisor"';
    collection.authRule = 'active = true';
    collection.manageRule = '@request.auth.role = "supervisor"';
    collection.fields = mergeFields(collection.fields, [
      textField("first_name", { required: true }),
      textField("last_name", { required: true }),
      selectField("role", ["cliente", "agente", "supervisor"], { required: true }),
      textField("department_id"),
      boolField("active"),
    ]);
    await pb.collections.create(collection);
  }

  try {
    const existingDepartments = await pb.collections.getOne("departments");
    existingDepartments.listRule = '@request.auth.id != ""';
    existingDepartments.viewRule = '@request.auth.id != ""';
    existingDepartments.createRule = '@request.auth.role = "supervisor"';
    existingDepartments.updateRule = '@request.auth.role = "supervisor"';
    existingDepartments.deleteRule = '@request.auth.role = "supervisor"';
    existingDepartments.fields = mergeFields(existingDepartments.fields, [
      textField("name", { required: true }),
      textField("description"),
      emailField("contact_email", { required: true }),
      boolField("active"),
      dateField("created_at"),
      dateField("updated_at"),
    ]);
    existingDepartments.indexes = [
      "CREATE UNIQUE INDEX idx_departments_name ON departments (name)",
    ];
    await pb.collections.update(existingDepartments.id, existingDepartments);
  } catch {
    await upsertCollectionByName("departments", () => {
      const collection = clone(scaffolds.base);
      collection.name = "departments";
      collection.listRule = '@request.auth.id != ""';
      collection.viewRule = '@request.auth.id != ""';
      collection.createRule = '@request.auth.role = "supervisor"';
      collection.updateRule = '@request.auth.role = "supervisor"';
      collection.deleteRule = '@request.auth.role = "supervisor"';
      collection.fields = [
        ...removeSystemFields(collection.fields),
        textField("name", { required: true }),
        textField("description"),
        emailField("contact_email", { required: true }),
        boolField("active"),
        dateField("created_at"),
        dateField("updated_at"),
      ];
      collection.indexes = [
        "CREATE UNIQUE INDEX idx_departments_name ON departments (name)",
      ];
      return collection;
    });
  }

  const usersCollectionId = await findCollectionId("users");
  const departmentsCollectionId = await findCollectionId("departments");

  try {
    const existingTickets = await pb.collections.getOne("tickets");
    existingTickets.listRule = '@request.auth.role = "supervisor" || created_by = @request.auth.id || (@request.auth.role = "agente" && (assigned_to = @request.auth.id || (department_id = @request.auth.department_id && assigned_to = "")))';
    existingTickets.viewRule = existingTickets.listRule;
    existingTickets.createRule = '@request.auth.id != "" && @request.auth.role = "cliente" && created_by = @request.auth.id';
    existingTickets.updateRule = '@request.auth.role = "supervisor" || (@request.auth.role = "agente" && (assigned_to = @request.auth.id || (department_id = @request.auth.department_id && assigned_to = "")))';
    existingTickets.deleteRule = '@request.auth.role = "supervisor"';
    existingTickets.fields = mergeFields(existingTickets.fields, [
      textField("ticket_number", { required: true, max: 30 }),
      textField("title", { required: true, max: 200 }),
      textField("description", { required: true }),
      selectField("priority", ["low", "medium", "high", "critical"], { required: true }),
      selectField("category", ["hardware", "software", "network", "other"], { required: true }),
      selectField("status", ["new", "in_progress", "waiting", "resolved", "reopened", "closed"], {
        required: true,
      }),
      selectField("close_reason", ["solucion_aplicada", "consulta_resuelta", "sin_respuesta_cliente", "duplicado", "otro"]),
      textField("close_reason_detail"),
      textField("resolution_note"),
      selectField("reopen_reason", ["problema_persistente", "solucion_incompleta", "nuevo_impacto", "otro"]),
      textField("reopen_reason_detail"),
      relationField("department_id", departmentsCollectionId, { required: true }),
      relationField("created_by", usersCollectionId, { required: true }),
      relationField("assigned_to", usersCollectionId),
      fileField("attachments", { maxSelect: 3, maxSize: 5242880 }),
      dateField("closed_at"),
      dateField("resolved_at"),
      dateField("created_at"),
      dateField("updated_at"),
    ]);
    existingTickets.indexes = [
      "CREATE UNIQUE INDEX idx_tickets_ticket_number ON tickets (ticket_number)",
    ];
    await pb.collections.update(existingTickets.id, existingTickets);
  } catch {
    await upsertCollectionByName("tickets", () => {
      const collection = clone(scaffolds.base);
      collection.name = "tickets";
      collection.listRule = '@request.auth.role = "supervisor" || created_by = @request.auth.id || (@request.auth.role = "agente" && (assigned_to = @request.auth.id || (department_id = @request.auth.department_id && assigned_to = "")))';
      collection.viewRule = collection.listRule;
      collection.createRule = '@request.auth.id != "" && @request.auth.role = "cliente" && created_by = @request.auth.id';
      collection.updateRule = '@request.auth.role = "supervisor" || (@request.auth.role = "agente" && (assigned_to = @request.auth.id || (department_id = @request.auth.department_id && assigned_to = "")))';
      collection.deleteRule = '@request.auth.role = "supervisor"';
      collection.fields = [
        ...removeSystemFields(collection.fields),
        textField("ticket_number", { required: true, max: 30 }),
        textField("title", { required: true, max: 200 }),
        textField("description", { required: true }),
        selectField("priority", ["low", "medium", "high", "critical"], { required: true }),
        selectField("category", ["hardware", "software", "network", "other"], { required: true }),
        selectField("status", ["new", "in_progress", "waiting", "resolved", "reopened", "closed"], {
          required: true,
        }),
        selectField("close_reason", ["solucion_aplicada", "consulta_resuelta", "sin_respuesta_cliente", "duplicado", "otro"]),
        textField("close_reason_detail"),
        textField("resolution_note"),
        selectField("reopen_reason", ["problema_persistente", "solucion_incompleta", "nuevo_impacto", "otro"]),
        textField("reopen_reason_detail"),
        relationField("department_id", departmentsCollectionId, { required: true }),
        relationField("created_by", usersCollectionId, { required: true }),
        relationField("assigned_to", usersCollectionId),
        fileField("attachments", { maxSelect: 3, maxSize: 5242880 }),
        dateField("closed_at"),
        dateField("resolved_at"),
        dateField("created_at"),
        dateField("updated_at"),
      ];
      collection.indexes = [
        "CREATE UNIQUE INDEX idx_tickets_ticket_number ON tickets (ticket_number)",
      ];
      return collection;
    });
  }

  const ticketsCollectionId = await findCollectionId("tickets");

  try {
    const existingComments = await pb.collections.getOne("comments");
    existingComments.listRule = '@request.auth.role = "supervisor" || (@request.auth.role = "agente" && ticket_id.department_id = @request.auth.department_id) || (ticket_id.created_by = @request.auth.id && is_internal = false)';
    existingComments.viewRule = existingComments.listRule;
    existingComments.createRule = '@request.auth.id != ""';
    existingComments.updateRule = '@request.auth.role = "supervisor" || author_id = @request.auth.id';
    existingComments.deleteRule = '@request.auth.role = "supervisor" || author_id = @request.auth.id';
    existingComments.fields = mergeFields(existingComments.fields, [
      relationField("ticket_id", ticketsCollectionId, { required: true }),
      relationField("author_id", usersCollectionId, { required: true }),
      textField("content", { required: true }),
      boolField("is_internal"),
      fileField("attachments", { maxSelect: 3, maxSize: 5242880 }),
      dateField("created_at"),
      dateField("updated_at"),
    ]);
    await pb.collections.update(existingComments.id, existingComments);
  } catch {
    await upsertCollectionByName("comments", () => {
      const collection = clone(scaffolds.base);
      collection.name = "comments";
      collection.listRule = '@request.auth.role = "supervisor" || (@request.auth.role = "agente" && ticket_id.department_id = @request.auth.department_id) || (ticket_id.created_by = @request.auth.id && is_internal = false)';
      collection.viewRule = collection.listRule;
      collection.createRule = '@request.auth.id != ""';
      collection.updateRule = '@request.auth.role = "supervisor" || author_id = @request.auth.id';
      collection.deleteRule = '@request.auth.role = "supervisor" || author_id = @request.auth.id';
      collection.fields = [
        ...removeSystemFields(collection.fields),
        relationField("ticket_id", ticketsCollectionId, { required: true }),
        relationField("author_id", usersCollectionId, { required: true }),
        textField("content", { required: true }),
        boolField("is_internal"),
        fileField("attachments", { maxSelect: 3, maxSize: 5242880 }),
        dateField("created_at"),
        dateField("updated_at"),
      ];
      return collection;
    });
  }

  try {
    const existingHistory = await pb.collections.getOne("ticket_history");
    existingHistory.listRule = '@request.auth.role = "supervisor" || (@request.auth.role = "agente" && ticket_id.department_id = @request.auth.department_id) || ticket_id.created_by = @request.auth.id';
    existingHistory.viewRule = existingHistory.listRule;
    existingHistory.createRule = '@request.auth.role = "supervisor" || @request.auth.role = "agente"';
    existingHistory.updateRule = '@request.auth.role = "supervisor"';
    existingHistory.deleteRule = '@request.auth.role = "supervisor"';
    existingHistory.fields = mergeFields(existingHistory.fields, [
      relationField("ticket_id", ticketsCollectionId, { required: true }),
      selectField("field_changed", ["status", "priority", "assigned_to"], { required: true }),
      textField("old_value"),
      textField("new_value"),
      relationField("changed_by", usersCollectionId, { required: true }),
      dateField("changed_at", { required: true }),
    ]);
    await pb.collections.update(existingHistory.id, existingHistory);
  } catch {
    await upsertCollectionByName("ticket_history", () => {
      const collection = clone(scaffolds.base);
      collection.name = "ticket_history";
      collection.listRule = '@request.auth.role = "supervisor" || (@request.auth.role = "agente" && ticket_id.department_id = @request.auth.department_id) || ticket_id.created_by = @request.auth.id';
      collection.viewRule = collection.listRule;
      collection.createRule = '@request.auth.role = "supervisor" || @request.auth.role = "agente"';
      collection.updateRule = '@request.auth.role = "supervisor"';
      collection.deleteRule = '@request.auth.role = "supervisor"';
      collection.fields = [
        ...removeSystemFields(collection.fields),
        relationField("ticket_id", ticketsCollectionId, { required: true }),
        selectField("field_changed", ["status", "priority", "assigned_to"], { required: true }),
        textField("old_value"),
        textField("new_value"),
        relationField("changed_by", usersCollectionId, { required: true }),
        dateField("changed_at", { required: true }),
      ];
      return collection;
    });
  }

  try {
    const existingNotifications = await pb.collections.getOne("notifications");
    existingNotifications.listRule = '@request.auth.id != "" && user_id = @request.auth.id';
    existingNotifications.viewRule = existingNotifications.listRule;
    existingNotifications.createRule = '@request.auth.id != ""';
    existingNotifications.updateRule = '@request.auth.id != "" && user_id = @request.auth.id';
    existingNotifications.deleteRule = '@request.auth.role = "supervisor" || (@request.auth.id != "" && user_id = @request.auth.id)';
    existingNotifications.fields = mergeFields(existingNotifications.fields, [
      relationField("user_id", usersCollectionId, { required: true }),
      relationField("ticket_id", ticketsCollectionId),
      textField("title", { required: true, max: 140 }),
      textField("message", { required: true, max: 500 }),
      textField("href", { required: true, max: 200 }),
      boolField("read"),
      numberField("created_ts"),
      dateField("created_at"),
      dateField("updated_at"),
    ]);
    await pb.collections.update(existingNotifications.id, existingNotifications);
  } catch {
    await upsertCollectionByName("notifications", () => {
      const collection = clone(scaffolds.base);
      collection.name = "notifications";
      collection.listRule = '@request.auth.id != "" && user_id = @request.auth.id';
      collection.viewRule = collection.listRule;
      collection.createRule = '@request.auth.id != ""';
      collection.updateRule = '@request.auth.id != "" && user_id = @request.auth.id';
      collection.deleteRule = '@request.auth.role = "supervisor" || (@request.auth.id != "" && user_id = @request.auth.id)';
      collection.fields = [
        ...removeSystemFields(collection.fields),
        relationField("user_id", usersCollectionId, { required: true }),
        relationField("ticket_id", ticketsCollectionId),
        textField("title", { required: true, max: 140 }),
        textField("message", { required: true, max: 500 }),
        textField("href", { required: true, max: 200 }),
        boolField("read"),
        numberField("created_ts"),
        dateField("created_at"),
        dateField("updated_at"),
      ];
      return collection;
    });
  }

  try {
    const existingJobRuns = await pb.collections.getOne("job_runs");
    existingJobRuns.listRule = '@request.auth.role = "supervisor"';
    existingJobRuns.viewRule = '@request.auth.role = "supervisor"';
    existingJobRuns.createRule = '@request.auth.role = "supervisor"';
    existingJobRuns.updateRule = '@request.auth.role = "supervisor"';
    existingJobRuns.deleteRule = '@request.auth.role = "supervisor"';
    existingJobRuns.fields = mergeFields(existingJobRuns.fields, [
      textField("job_name", { required: true, max: 80 }),
      selectField("trigger_source", ["manual", "scheduler", "qa"], { required: true }),
      selectField("status", ["running", "success", "partial_failure", "failed", "skipped"], { required: true }),
      boolField("dry_run"),
      numberField("close_after_hours", { min: 0 }),
      numberField("candidate_count", { min: 0 }),
      numberField("processed_count", { min: 0 }),
      numberField("closed_count", { min: 0 }),
      numberField("skipped_count", { min: 0 }),
      numberField("error_count", { min: 0 }),
      textField("cutoff_at"),
      textField("error_summary", { max: 1000 }),
      dateField("started_at", { required: true }),
      dateField("finished_at"),
    ]);
    await pb.collections.update(existingJobRuns.id, existingJobRuns);
  } catch {
    await upsertCollectionByName("job_runs", () => {
      const collection = clone(scaffolds.base);
      collection.name = "job_runs";
      collection.listRule = '@request.auth.role = "supervisor"';
      collection.viewRule = '@request.auth.role = "supervisor"';
      collection.createRule = '@request.auth.role = "supervisor"';
      collection.updateRule = '@request.auth.role = "supervisor"';
      collection.deleteRule = '@request.auth.role = "supervisor"';
      collection.fields = [
        ...removeSystemFields(collection.fields),
        textField("job_name", { required: true, max: 80 }),
        selectField("trigger_source", ["manual", "scheduler", "qa"], { required: true }),
        selectField("status", ["running", "success", "partial_failure", "failed", "skipped"], { required: true }),
        boolField("dry_run"),
        numberField("close_after_hours", { min: 0 }),
        numberField("candidate_count", { min: 0 }),
        numberField("processed_count", { min: 0 }),
        numberField("closed_count", { min: 0 }),
        numberField("skipped_count", { min: 0 }),
        numberField("error_count", { min: 0 }),
        textField("cutoff_at"),
        textField("error_summary", { max: 1000 }),
        dateField("started_at", { required: true }),
        dateField("finished_at"),
      ];
      return collection;
    });
  }

  try {
    const existingJobLocks = await pb.collections.getOne("job_locks");
    existingJobLocks.listRule = '@request.auth.role = "supervisor"';
    existingJobLocks.viewRule = '@request.auth.role = "supervisor"';
    existingJobLocks.createRule = '@request.auth.role = "supervisor"';
    existingJobLocks.updateRule = '@request.auth.role = "supervisor"';
    existingJobLocks.deleteRule = '@request.auth.role = "supervisor"';
    existingJobLocks.fields = mergeFields(existingJobLocks.fields, [
      textField("job_name", { required: true, max: 80 }),
      textField("locked_by", { required: true, max: 120 }),
      dateField("locked_at", { required: true }),
      dateField("lock_expires_at", { required: true }),
    ]);
    existingJobLocks.indexes = [
      "CREATE UNIQUE INDEX idx_job_locks_job_name ON job_locks (job_name)",
    ];
    await pb.collections.update(existingJobLocks.id, existingJobLocks);
  } catch {
    await upsertCollectionByName("job_locks", () => {
      const collection = clone(scaffolds.base);
      collection.name = "job_locks";
      collection.listRule = '@request.auth.role = "supervisor"';
      collection.viewRule = '@request.auth.role = "supervisor"';
      collection.createRule = '@request.auth.role = "supervisor"';
      collection.updateRule = '@request.auth.role = "supervisor"';
      collection.deleteRule = '@request.auth.role = "supervisor"';
      collection.fields = [
        ...removeSystemFields(collection.fields),
        textField("job_name", { required: true, max: 80 }),
        textField("locked_by", { required: true, max: 120 }),
        dateField("locked_at", { required: true }),
        dateField("lock_expires_at", { required: true }),
      ];
      collection.indexes = [
        "CREATE UNIQUE INDEX idx_job_locks_job_name ON job_locks (job_name)",
      ];
      return collection;
    });
  }
}

async function seedData() {
  const departmentTimestamp = "2026-04-01 08:00:00.000Z";

  const deptItId = await upsertRecord("departments", 'name = "Soporte TI"', {
    active: true,
    contact_email: "soporte-ti@techsupport.local",
    created_at: departmentTimestamp,
    description: "Incidencias de software y estaciones de trabajo.",
    name: "Soporte TI",
    updated_at: departmentTimestamp,
  });

  const deptNetworkId = await upsertRecord("departments", 'name = "Redes"', {
    active: true,
    contact_email: "redes@techsupport.local",
    created_at: departmentTimestamp,
    description: "Conectividad, VPN y enlaces internos.",
    name: "Redes",
    updated_at: departmentTimestamp,
  });

  const deptFieldId = await upsertRecord("departments", 'name = "Mesa de Campo"', {
    active: true,
    contact_email: "campo@techsupport.local",
    created_at: departmentTimestamp,
    description: "Visitas presenciales y hardware onsite.",
    name: "Mesa de Campo",
    updated_at: departmentTimestamp,
  });

  const supervisorId = await upsertAuthRecord("users", "supervisor@techsupport.local", {
    active: true,
    department_id: "",
    first_name: "Sofia",
    last_name: "Supervisor",
    password: "ChangeMe123!",
    role: "supervisor",
    verified: true,
  });

  const agentItId = await upsertAuthRecord("users", "ana.agente@techsupport.local", {
    active: true,
    department_id: deptItId,
    first_name: "Ana",
    last_name: "Agente",
    password: "ChangeMe123!",
    role: "agente",
    verified: true,
  });

  const agentIt2Id = await upsertAuthRecord("users", "diego.soporte@techsupport.local", {
    active: true,
    department_id: deptItId,
    first_name: "Diego",
    last_name: "Soporte",
    password: "ChangeMe123!",
    role: "agente",
    verified: true,
  });

  const agentNetworkId = await upsertAuthRecord("users", "luis.redes@techsupport.local", {
    active: true,
    department_id: deptNetworkId,
    first_name: "Luis",
    last_name: "Redes",
    password: "ChangeMe123!",
    role: "agente",
    verified: true,
  });

  const agentFieldId = await upsertAuthRecord("users", "mario.campo@techsupport.local", {
    active: true,
    department_id: deptFieldId,
    first_name: "Mario",
    last_name: "Campo",
    password: "ChangeMe123!",
    role: "agente",
    verified: true,
  });

  const acmeClientId = await upsertAuthRecord("users", "cliente@acme.com", {
    active: true,
    department_id: "",
    first_name: "Claudia",
    last_name: "Acme",
    password: "ChangeMe123!",
    role: "cliente",
    verified: true,
  });

  const globexClientId = await upsertAuthRecord("users", "cliente@globex.com", {
    active: true,
    department_id: "",
    first_name: "Gaston",
    last_name: "Globex",
    password: "ChangeMe123!",
    role: "cliente",
    verified: true,
  });

  const initechClientId = await upsertAuthRecord("users", "cliente@initech.com", {
    active: true,
    department_id: "",
    first_name: "Irene",
    last_name: "Initech",
    password: "ChangeMe123!",
    role: "cliente",
    verified: true,
  });

  const ticket1Id = await upsertRecord("tickets", 'title = "No puedo acceder al ERP corporativo"', {
    assigned_to: agentItId,
    category: "software",
    created_at: "2026-04-01 08:30:00.000Z",
    created_by: acmeClientId,
    department_id: deptItId,
    description: "El cliente recibe error de autenticacion desde esta manana.",
    priority: "high",
    status: "in_progress",
    ticket_number: "TKT-00001",
    title: "No puedo acceder al ERP corporativo",
    updated_at: "2026-04-08 10:15:00.000Z",
  });

  const ticket2Id = await upsertRecord("tickets", 'title = "VPN intermitente para usuarios remotos"', {
    assigned_to: agentNetworkId,
    category: "network",
    created_at: "2026-03-28 15:00:00.000Z",
    created_by: globexClientId,
    department_id: deptNetworkId,
    description: "Los usuarios pierden sesion varias veces al dia.",
    priority: "critical",
    status: "waiting",
    ticket_number: "TKT-00002",
    title: "VPN intermitente para usuarios remotos",
    updated_at: "2026-04-07 18:40:00.000Z",
  });

  const ticket3Id = await upsertRecord("tickets", 'title = "Laptop con falla de disco"', {
    category: "hardware",
    created_at: "2026-04-08 06:20:00.000Z",
    created_by: initechClientId,
    department_id: deptFieldId,
    description: "Equipo no inicia y emite ruido de lectura.",
    priority: "medium",
    status: "new",
    ticket_number: "TKT-00003",
    title: "Laptop con falla de disco",
    updated_at: "2026-04-08 06:20:00.000Z",
  });

  const ticket4Id = await upsertRecord("tickets", 'title = "Reapertura por error en impresora fiscal"', {
    assigned_to: agentFieldId,
    category: "hardware",
    created_at: "2026-03-30 11:45:00.000Z",
    created_by: acmeClientId,
    department_id: deptFieldId,
    description: "El problema reaparecio luego de la visita tecnica.",
    priority: "high",
    status: "reopened",
    ticket_number: "TKT-00004",
    title: "Reapertura por error en impresora fiscal",
    updated_at: "2026-04-08 09:20:00.000Z",
  });

  await upsertRecord(
    "comments",
    `ticket_id = "${ticket1Id}" && content = "El error aparece al intentar entrar con cualquier usuario."`,
    {
      author_id: acmeClientId,
      content: "El error aparece al intentar entrar con cualquier usuario.",
      created_at: "2026-04-01 08:32:00.000Z",
      is_internal: false,
      ticket_id: ticket1Id,
      updated_at: "2026-04-01 08:32:00.000Z",
    },
  );

  await upsertRecord(
    "comments",
    `ticket_id = "${ticket1Id}" && content = "Se detecto sincronizacion pendiente con el proveedor de identidad."`,
    {
      author_id: agentItId,
      content: "Se detecto sincronizacion pendiente con el proveedor de identidad.",
      created_at: "2026-04-08 09:50:00.000Z",
      is_internal: true,
      ticket_id: ticket1Id,
      updated_at: "2026-04-08 09:50:00.000Z",
    },
  );

  await upsertRecord(
    "comments",
    `ticket_id = "${ticket2Id}" && content = "Solicitamos al cliente horarios exactos para correlacionar con los logs."`,
    {
      author_id: agentNetworkId,
      content: "Solicitamos al cliente horarios exactos para correlacionar con los logs.",
      created_at: "2026-04-07 18:40:00.000Z",
      is_internal: false,
      ticket_id: ticket2Id,
      updated_at: "2026-04-07 18:40:00.000Z",
    },
  );

  await upsertRecord(
    "ticket_history",
    `ticket_id = "${ticket1Id}" && field_changed = "assigned_to" && new_value = "ana.agente@techsupport.local"`,
    {
      changed_at: "2026-04-01 08:35:00.000Z",
      changed_by: supervisorId,
      field_changed: "assigned_to",
      new_value: "ana.agente@techsupport.local",
      old_value: "Sin asignar",
      ticket_id: ticket1Id,
    },
  );

  void agentIt2Id;

  await upsertRecord(
    "ticket_history",
    `ticket_id = "${ticket1Id}" && field_changed = "status" && new_value = "in_progress"`,
    {
      changed_at: "2026-04-01 08:35:00.000Z",
      changed_by: agentItId,
      field_changed: "status",
      new_value: "in_progress",
      old_value: "new",
      ticket_id: ticket1Id,
    },
  );

  await upsertRecord(
    "ticket_history",
    `ticket_id = "${ticket4Id}" && field_changed = "status" && new_value = "reopened"`,
    {
      changed_at: "2026-04-08 09:20:00.000Z",
      changed_by: acmeClientId,
      field_changed: "status",
      new_value: "reopened",
      old_value: "resolved",
      ticket_id: ticket4Id,
    },
  );

  return {
    agentItId,
    ticket1Id,
    ticket2Id,
    ticket3Id,
    ticket4Id,
  };
}

async function main() {
  await authenticateSuperuser();
  await ensureCollections();
  await seedData();

  console.log("PocketBase bootstrap completo.");
  console.log("Usuarios de prueba listos:");
  console.log("- supervisor@techsupport.local / ChangeMe123!");
  console.log("- ana.agente@techsupport.local / ChangeMe123!");
  console.log("- cliente@acme.com / ChangeMe123!");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
