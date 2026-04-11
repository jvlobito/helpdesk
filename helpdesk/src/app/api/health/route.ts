import { NextResponse } from "next/server";

import { pocketbaseUrl } from "@/lib/pocketbase";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "helpdesk-mvp",
    pocketbaseUrl,
  });
}
