import { NextResponse } from "next/server";
import { z } from "zod";

import { getDefaultAppRoute, isUserRole } from "@/lib/auth";
import {
  clearPocketBaseAuthCookie,
  createPocketBase,
  exportPocketBaseAuthCookie,
} from "@/lib/pocketbase";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

function getErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "message" in error.response &&
    typeof error.response.message === "string"
  ) {
    return error.response.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Credenciales invalidas." }, { status: 400 });
  }

  const client = createPocketBase();

  try {
    const auth = await client.collection("users").authWithPassword(parsed.data.email, parsed.data.password);
    const role = auth.record?.role;

    if (!isUserRole(role) || auth.record?.active === false) {
      const response = NextResponse.json(
        { message: "La cuenta no tiene un rol operativo valido." },
        { status: 403 },
      );
      response.headers.append("Set-Cookie", clearPocketBaseAuthCookie(client));
      return response;
    }

    const response = NextResponse.json({ redirectTo: getDefaultAppRoute(role) });
    response.headers.append("Set-Cookie", exportPocketBaseAuthCookie(client));

    return response;
  } catch (error) {
    return NextResponse.json(
      { message: getErrorMessage(error, "No fue posible iniciar sesion.") },
      { status: 400 },
    );
  }
}
