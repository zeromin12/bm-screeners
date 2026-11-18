import { createClient } from "@supabase/supabase-js";
const id = process.argv[2];
if (!/^[a-f0-9-]{36}$/i.test(id ?? "")) {
  console.error(
    "Cara pakai: npm run admin -- USER_UUID (salin dari Supabase Authentication → Users)",
  );
  process.exit(1);
}
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
  console.error("Isi URL dan secret key di .env.local terlebih dahulu.");
  process.exit(1);
}
const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
const { data, error } = await db
  .from("profiles")
  .update({ role: "admin" })
  .eq("id", id)
  .select("id,role")
  .single();
if (error) {
  console.error("Gagal: periksa UUID, migration, dan key server.");
  process.exit(1);
}
console.log("Role admin berhasil diberikan:", data.id);
