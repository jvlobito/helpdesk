import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getDefaultAppRoute, readSessionFromCookieString, type AuthSession } from "@/lib/auth";
import type { UserRole } from "@/lib/helpdesk";

export async function getAuthSession() {
  const cookieStore = await cookies();
  return readSessionFromCookieString(cookieStore.toString());
}

export async function requireAuthSession(): Promise<AuthSession> {
  const session = await getAuthSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function requireRoleSession(role: UserRole): Promise<AuthSession> {
  const session = await requireAuthSession();

  if (session.user.role !== role) {
    redirect(getDefaultAppRoute(session.user.role));
  }

  return session;
}

export async function redirectAuthenticatedUser() {
  const session = await getAuthSession();

  if (session) {
    redirect(getDefaultAppRoute(session.user.role));
  }
}
