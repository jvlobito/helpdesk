import { NextResponse } from "next/server";
import { z } from "zod";

import { getDefaultAppRoute } from "@/lib/auth";
import { createPocketBase, exportPocketBaseAuthCookie } from "@/lib/pocketbase";

const registerSchema = z.object({
  email: z.email(),
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
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
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Datos de registro invalidos." }, { status: 400 });
  }

  const client = createPocketBase();

  try {
    await client.collection("users").create({
      active: true,
      email: parsed.data.email,
      first_name: parsed.data.firstName,
      last_name: parsed.data.lastName,
      password: parsed.data.password,
      passwordConfirm: parsed.data.password,
      role: "cliente",
    });

    await client.collection("users").authWithPassword(parsed.data.email, parsed.data.password);

    const response = NextResponse.json({ redirectTo: getDefaultAppRoute("cliente") });
    response.headers.append("Set-Cookie", exportPocketBaseAuthCookie(client));

    return response;
  } catch (error) {
    return NextResponse.json(
      { message: getErrorMessage(error, "No fue posible crear la cuenta.") },
      { status: 400 },
    );
  }
}
