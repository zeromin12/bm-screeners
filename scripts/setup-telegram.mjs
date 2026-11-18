const token = process.env.TELEGRAM_BOT_TOKEN,
  secret = process.env.TELEGRAM_WEBHOOK_SECRET,
  url = process.env.APP_URL;
if (!token || !secret || secret.length < 32 || !url?.startsWith("https://")) {
  console.error(
    "Isi TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET (>=32 karakter) dan APP_URL HTTPS di .env.local.",
  );
  process.exit(1);
}
const r = await fetch("https://api.telegram.org/bot" + token + "/setWebhook", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    url: url.replace(/\/$/, "") + "/api/telegram/webhook",
    secret_token: secret,
    allowed_updates: ["message"],
  }),
});
const j = await r.json();
if (!j.ok) {
  console.error("Webhook gagal. Periksa token, HTTPS, dan akses domain.");
  process.exit(1);
}
console.log("Webhook BM Screeners berhasil diatur.");
