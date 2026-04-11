import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth-server";

export async function GET() {
  const session = await getAuthSession();

  return NextResponse.json({ session });
}
