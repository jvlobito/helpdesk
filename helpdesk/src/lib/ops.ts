import { headers } from "next/headers";

export async function getRequestCorrelationId() {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-request-id");

  if (forwarded) {
    return forwarded;
  }

  return crypto.randomUUID();
}

export function logOperationalEvent(event: string, details: Record<string, unknown>) {
  console.info(
    JSON.stringify({
      details,
      event,
      timestamp: new Date().toISOString(),
    }),
  );
}

export function logOperationalError(event: string, error: unknown, details: Record<string, unknown> = {}) {
  const message = error instanceof Error ? error.message : String(error);

  console.error(
    JSON.stringify({
      details,
      error: message,
      event,
      timestamp: new Date().toISOString(),
    }),
  );
}
