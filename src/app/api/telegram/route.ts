import { createHash, randomBytes } from "node:crypto";
import { requireUser, adminClient } from "../../../lib/supabase/server";
import { apiError, json, checkOrigin, bodyJSON, rateLimit } from "../../../lib/http";
import { sendTelegram } from "../../../lib/alerts";
import { z } from "zod";
export async function GET() {
  try {
    const { db } = await requireUser();
    const { data: channel } = await db
      .from("notification_channels")
      .select("verified_at")
      .maybeSingle();
    const { data: events } = await db
      .from("alert_events")
      .select("id,symbol,message,status,created_at")
      .order("created_at", { ascending: false })
      .limit(30);
    return json({ connected: !!channel, events: events ?? [] });
  } catch (e) {
    return apiError(e);
  }
}
export async function POST(req: Request) {
  try {
    checkOrigin(req);
    const { user } = await requireUser();
    await rateLimit(user.id, "telegram", 5);
    const { action } = z
      .object({ action: z.enum(["link", "test", "disconnect"]) })
      .parse(await bodyJSON(req));
    const db = adminClient();
    if (action === "link") {
      if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_BOT_USERNAME)
        throw new Error(
          "Admin perlu mengatur bot dan webhook terlebih dahulu.",
        );
      const token = randomBytes(24).toString("base64url"),
        hash = createHash("sha256").update(token).digest("hex");
      await db.from("telegram_links").delete().eq("user_id", user.id);
      const { error } = await db
        .from("telegram_links")
        .insert({
          user_id: user.id,
          token_hash: hash,
          expires_at: new Date(Date.now() + 600000).toISOString(),
        });
      if (error) throw new Error("Gagal membuat kode verifikasi.");
      return json({
        url:
          "https://t.me/" +
          process.env.TELEGRAM_BOT_USERNAME +
          "?start=" +
          token,
      });
    }
    if (action === "disconnect") {
      await db.from("notification_channels").delete().eq("user_id", user.id);
      return json({ ok: true });
    }
    const { data } = await db
      .from("notification_channels")
      .select("chat_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!data) throw new Error("Hubungkan Telegram terlebih dahulu.");
    await sendTelegram(
      data.chat_id,
      "Tes BM Screeners berhasil. Notifikasi terhubung ke akun Anda.",
    );
    return json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
