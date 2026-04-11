import { NextResponse } from "next/server";

import { clearPocketBaseAuthCookie, createPocketBase } from "@/lib/pocketbase";

export async function POST(request: Request) {
  const client = createPocketBase();
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.headers.append("Set-Cookie", clearPocketBaseAuthCookie(client));

  return response;
}
