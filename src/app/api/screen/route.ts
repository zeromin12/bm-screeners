import { getMarket } from "../../../lib/providers/market";
import { mode, requireUser } from "../../../lib/supabase/server";
import { apiError, json, bodyJSON, checkOrigin } from "../../../lib/http";
import { filterSchema } from "../../../lib/schema";
import { analyze, filterStocks } from "../../../lib/analysis";
export async function POST(req: Request) {
  try {
    checkOrigin(req);
    if (mode() === "production") await requireUser();
    const filter = filterSchema.parse(await bodyJSON(req));
    const market = await getMarket();
    return json(
      filterStocks(
        market.stocks.map((s) => analyze(s, market.benchmark?.bars)),
        filter,
      ).map((s) => ({ symbol: s.symbol, metrics: s.metrics, score: s.score })),
    );
  } catch (e) {
    return apiError(e);
  }
}
