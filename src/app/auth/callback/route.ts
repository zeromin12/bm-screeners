import { NextResponse } from "next/server";
import { serverClient } from "../../../lib/supabase/server";
export async function GET(req: Request) {
  const url = new URL(req.url),
    code = url.searchParams.get("code");
  const path =
    url.searchParams.get("next") === "/reset-password"
      ? "/reset-password"
      : "/dashboard";
  if (code) {
    try {
      const db = await serverClient();
      const { error } = await db.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(new URL(path, url.origin));
    } catch {
      /* Invalid or expired auth code: show login error. */
    }
  }
  return NextResponse.redirect(new URL("/login?error=callback", url.origin));
}
