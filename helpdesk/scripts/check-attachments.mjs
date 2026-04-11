import fs from "node:fs";
import path from "node:path";

const base = process.env.CHECK_APP_URL ?? "http://127.0.0.1:3022";

function normalizeLocation(location) {
  if (!location) {
    return "/app/tickets";
  }

  if (location.startsWith("http://") || location.startsWith("https://")) {
    return new URL(location).pathname + (new URL(location).search || "");
  }

  return location;
}

async function main() {
  const loginRes = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "cliente@acme.com", password: "ChangeMe123!" }),
  });

  const cookie = (loginRes.headers.get("set-cookie") || "").split(";")[0];

  if (!cookie) {
    throw new Error("No se obtuvo cookie de sesion.");
  }

  const formPageRes = await fetch(`${base}/app/tickets/new`, {
    headers: { cookie },
  });
  const formPageHtml = await formPageRes.text();
  const actionMatch = formPageHtml.match(/<form[^>]*action="([^"]+)"/i);

  if (!actionMatch) {
    throw new Error("No se encontro la action del formulario de ticket.");
  }

  const actionUrl = actionMatch[1];
  const form = new FormData();
  form.set("title", `Ticket con adjunto ${Date.now()}`);
  form.set("description", "Prueba automatizada de adjuntos en ticket.");
  form.set("priority", "medium");
  form.set("category", "software");
  form.set("departmentId", "jjdvp372ukarfh0");

  const filePath = path.join(process.cwd(), "qa-attachment.txt");
  const blob = new Blob([fs.readFileSync(filePath)], { type: "text/plain" });
  form.append("attachments", blob, "qa-attachment.txt");

  const createRes = await fetch(`${base}${actionUrl}`, {
    method: "POST",
    headers: { cookie },
    body: form,
    redirect: "manual",
  });

  const location = normalizeLocation(createRes.headers.get("location"));
  const listRes = await fetch(`${base}${location}`, {
    headers: { cookie },
  });
  const listHtml = await listRes.text();
  const ticketMatch = listHtml.match(/\/app\/tickets\/([a-z0-9]+)/i);

  if (!ticketMatch) {
    throw new Error("No se encontro el ticket creado en la lista.");
  }

  const detailRes = await fetch(`${base}/app/tickets/${ticketMatch[1]}`, {
    headers: { cookie },
  });
  const detailHtml = await detailRes.text();

  console.log(
    JSON.stringify(
      {
        actionUrl,
        createStatus: createRes.status,
        detailHasAttachment: detailHtml.includes("qa-attachment.txt"),
        location,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
