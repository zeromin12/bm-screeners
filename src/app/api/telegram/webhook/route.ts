import { createHash } from "node:crypto";
import { adminClient } from "../../../../lib/supabase/server";
import { json, bodyJSON } from "../../../../lib/http";
import { sendTelegram } from "../../../../lib/alerts";
export async function POST(req: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (
    !secret ||
    secret.length < 32 ||
    req.headers.get("x-telegram-bot-api-secret-token") !== secret
  )
    return json({ error: "Unauthorized" }, 401);
  try {
    const body = await bodyJSON(req, 100000),
      msg = body.message;
    const match =
      typeof msg?.text === "string"
        ? msg.text.match(/^\/start ([A-Za-z0-9_-]{32})$/)
        : null;
    if (match && msg.chat?.type === "private") {
      const hash = createHash("sha256").update(match[1]).digest("hex");
      const { data, error } = await adminClient().rpc("claim_telegram_link", {
        p_hash: hash,
        p_chat: String(msg.chat.id),
      });
      if (data && !error)
        await sendTelegram(
          String(msg.chat.id),
          "BM Screeners terhubung. Atur alert di website.",
        );
    }
    return json({ ok: true });
  } catch {
    return json({ error: "Webhook belum diproses." }, 500);
  }
}
