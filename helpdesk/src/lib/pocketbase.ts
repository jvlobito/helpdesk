import PocketBase from "pocketbase";

const defaultUrl = "http://127.0.0.1:8090";

export const POCKETBASE_AUTH_COOKIE = "pb_auth";

export function createPocketBase() {
  const baseUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL ?? defaultUrl;
  const client = new PocketBase(baseUrl);
  client.autoCancellation(false);

  return client;
}

export const pocketbaseUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL ?? defaultUrl;

export function exportPocketBaseAuthCookie(client: PocketBase) {
  return client.authStore.exportToCookie(
    {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
    POCKETBASE_AUTH_COOKIE,
  );
}

export function clearPocketBaseAuthCookie(client: PocketBase) {
  client.authStore.clear();

  return client.authStore.exportToCookie(
    {
      httpOnly: true,
      maxAge: 0,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
    POCKETBASE_AUTH_COOKIE,
  );
}
