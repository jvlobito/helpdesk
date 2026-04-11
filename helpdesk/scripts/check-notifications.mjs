const base = process.env.CHECK_APP_URL ?? "http://127.0.0.1:3026";

async function login(email, password) {
  const res = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  return (res.headers.get("set-cookie") || "").split(";")[0];
}

async function html(path, cookie) {
  const res = await fetch(`${base}${path}`, {
    headers: { cookie },
  });

  return res.text();
}

async function main() {
  const agentCookie = await login("ana.agente@techsupport.local", "ChangeMe123!");
  const ticketPage = await html("/app/agent/tickets?q=TKT-00001", agentCookie);
  const ticketId = (ticketPage.match(/\/app\/agent\/tickets\/([a-z0-9]+)/i) || [])[1];

  if (!ticketId) {
    throw new Error("No se encontro ticket para validar notificaciones.");
  }

  const detail = await html(`/app/agent/tickets/${ticketId}`, agentCookie);
  const action = (detail.match(/<form[^>]*action="([^"]+)"/i) || [])[1];

  if (!action) {
    throw new Error("No se encontro action del formulario de comentario.");
  }

  const form = new FormData();
  form.set("ticketId", ticketId);
  form.set("returnPath", `/app/agent/tickets/${ticketId}`);
  form.set("content", `Comentario QA 4.2 ${Date.now()}`);

  const commentRes = await fetch(`${base}${action}`, {
    method: "POST",
    headers: { cookie: agentCookie },
    body: form,
    redirect: "manual",
  });

  const clientCookie = await login("cliente@acme.com", "ChangeMe123!");
  const clientPage = await html("/app/tickets", clientCookie);

  console.log(
    JSON.stringify(
      {
        commentStatus: commentRes.status,
        clientHasNotification: clientPage.includes("Nuevo comentario"),
        notificationsVisible: clientPage.includes("Notificaciones"),
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
