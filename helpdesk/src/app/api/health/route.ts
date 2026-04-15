import { NextResponse } from "next/server";

import { createAdminPocketBase } from "@/lib/helpdesk-actions";
import { getRequestCorrelationId, logOperationalError, logOperationalEvent } from "@/lib/ops";
import { createPocketBase, pocketbaseUrl } from "@/lib/pocketbase";

export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();
  const correlationId = await getRequestCorrelationId();

  try {
    const pb = createPocketBase();
    await pb.health.check();
    const adminPb = await createAdminPocketBase();
    let latestAutoCloseRun = null;

    try {
      const lastRun = await adminPb.collection("job_runs").getFirstListItem('job_name = "tickets:auto-close"', {
        sort: "-started_at",
      });

      latestAutoCloseRun = {
        errorCount: lastRun.error_count,
        finishedAt: lastRun.finished_at,
        ok: lastRun.status !== "failed",
        status: lastRun.status,
        triggerSource: lastRun.trigger_source,
      };
    } catch (error) {
      const status = typeof error === "object" && error !== null && "status" in error ? error.status : null;

      if (status !== 404) {
        throw error;
      }
    }

    const body = {
      dependencies: {
        jobs: {
          autoClose: latestAutoCloseRun,
        },
        pocketbase: {
          ok: true,
          url: pocketbaseUrl,
        },
      },
      correlationId,
      ok: true,
      responseTimeMs: Date.now() - startedAt,
      service: "helpdesk-mvp",
      timestamp: new Date().toISOString(),
    };

    logOperationalEvent("api.health.ok", {
      correlationId,
      latestAutoCloseRun,
      responseTimeMs: body.responseTimeMs,
    });

    return NextResponse.json(body);
  } catch (error) {
    const body = {
      dependencies: {
        jobs: {
          autoClose: null,
        },
        pocketbase: {
          ok: false,
          url: pocketbaseUrl,
        },
      },
      correlationId,
      ok: false,
      responseTimeMs: Date.now() - startedAt,
      service: "helpdesk-mvp",
      timestamp: new Date().toISOString(),
    };

    logOperationalError("api.health.error", error, {
      correlationId,
      responseTimeMs: body.responseTimeMs,
    });

    return NextResponse.json(body, { status: 503 });
  }
}
