import { getMarket } from "../../../lib/providers/market";
import { mode, requireUser } from "../../../lib/supabase/server";
import { apiError, json } from "../../../lib/http";
export async function GET() {
  try {
    if (mode() === "production") await requireUser();
    return json(await getMarket());
  } catch (e) {
    return apiError(e);
  }
}
