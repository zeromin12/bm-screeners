import { NextResponse } from "next/server";
import { serverClient } from "../../../lib/supabase/server";
export async function GET(req: Request) {
  const url = new URL(req.url),
    token_hash = url.searchParams.get("token_hash"),
    type = url.searchParams.get("type");
  if (
    token_hash &&
    (type === "email" || type === "recovery" || type === "signup")
  ) {
    const db = await serverClient();
    const { error } = await db.auth.verifyOtp({ token_hash, type });
    if (!error)
      return NextResponse.redirect(
        new URL(
          type === "recovery" ? "/reset-password" : "/dashboard",
          url.origin,
        ),
      );
  }
  return NextResponse.redirect(new URL("/login?error=confirm", url.origin));
}
