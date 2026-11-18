import { schedulerAuthorized, json, apiError } from "../../../lib/http";
import { fetchBridge, persistMarket } from "../../../lib/providers/market";
import { evaluateAlerts, deliverAlerts } from "../../../lib/alerts";
import { adminClient, mode } from "../../../lib/supabase/server";
import { revalidateTag } from "next/cache";
export const maxDuration = 60;
export async function GET(req: Request) {
  if (!schedulerAuthorized(req)) return json({ error: "Unauthorized" }, 401);
  if (mode() !== "production")
    return json({ error: "Job produksi dinonaktifkan di demo." }, 409);
  const db = adminClient();
  try {
    let sync = null;
    if (process.env.MARKET_BRIDGE_URL) {
      sync = await persistMarket(await fetchBridge());
      revalidateTag("market", { expire: 0 });
    }
    const created = await evaluateAlerts(),
      sent = await deliverAlerts();
    await db
      .from("sync_jobs")
      .insert({
        status: "success",
        detail: JSON.stringify({ sync, created, sent }),
      });
    return json({ sync, created, sent });
  } catch (e) {
    await db
      .from("sync_jobs")
      .insert({
        status: "failed",
        detail: e instanceof Error ? e.message : "Job gagal",
      });
    return apiError(e);
  }
}
