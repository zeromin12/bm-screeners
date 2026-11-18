import { requireAdmin, adminClient } from "../../../lib/supabase/server";
import { apiError, json, checkOrigin, bodyJSON, rateLimit } from "../../../lib/http";
import { marketSchema } from "../../../lib/schema";
import { persistMarket, fetchBridge } from "../../../lib/providers/market";
import { revalidateTag } from "next/cache";
export const maxDuration = 60;
export async function GET() {
  try {
    await requireAdmin();
    const db = adminClient();
    const [{ data: jobs }, { data: users }, { data: events }] =
      await Promise.all([
        db
          .from("sync_jobs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(20),
        db
          .from("profiles")
          .select("id,display_name,role,created_at")
          .limit(100),
        db
          .from("alert_events")
          .select("id,symbol,status,attempts,created_at")
          .order("created_at", { ascending: false })
          .limit(30),
      ]);
    return json({
      jobs,
      users,
      events,
      bridgeConfigured: !!process.env.MARKET_BRIDGE_URL,
      telegramConfigured: !!process.env.TELEGRAM_BOT_TOKEN,
    });
  } catch (e) {
    return apiError(e);
  }
}
export async function POST(req: Request) {
  try {
    checkOrigin(req);
    const { user } = await requireAdmin();
    await rateLimit(user.id, "import", 5);
    const body = await bodyJSON(req, 3_500_000);
    const market =
      body.action === "sync"
        ? await fetchBridge()
        : marketSchema.parse(body.market);
    const result = await persistMarket(market);
    revalidateTag("market", { expire: 0 });
    await adminClient()
      .from("audit_logs")
      .insert({ user_id: user.id, action: "market_import", detail: result });
    return json(result);
  } catch (e) {
    return apiError(e);
  }
}
