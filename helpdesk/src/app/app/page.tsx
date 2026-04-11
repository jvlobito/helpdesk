import { redirect } from "next/navigation";

import { getDefaultAppRoute } from "@/lib/auth";
import { requireAuthSession } from "@/lib/auth-server";

export default async function AppHomePage() {
  const session = await requireAuthSession();

  redirect(getDefaultAppRoute(session.user.role));
}
