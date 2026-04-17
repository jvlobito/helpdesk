import { NextResponse } from "next/server";
import { z } from "zod";

import { createPocketBase } from "@/lib/pocketbase";

const forgotPasswordSchema = z.object({
  email: z.email(),
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
  const parsed = forgotPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Email invalido." }, { status: 400 });
  }

  const client = createPocketBase();

  try {
    await client.collection("users").requestPasswordReset(parsed.data.email);

    return NextResponse.json({
      message: "Si el email existe, PocketBase procesara la solicitud de recuperacion.",
    });
  } catch (error) {
    return NextResponse.json(
      { message: getErrorMessage(error, "No fue posible solicitar la recuperacion de password.") },
      { status: 400 },
    );
  }
}
