import { requireUser } from "../../../lib/supabase/server";
import { apiError, json } from "../../../lib/http";
import { resourceSchemas } from "../../../lib/schema";
export async function GET() {
  try {
    const { db } = await requireUser();
    const results = await Promise.all(
      Object.keys(resourceSchemas).map(async (r) => {
        const { data, error } = await db
          .from(r)
          .select("id,payload,created_at")
          .order("created_at");
        if (error)
          throw new Error("Tabel " + r + " belum siap. Jalankan migration.");
        return [r, data];
      }),
    );
    return json(Object.fromEntries(results));
  } catch (e) {
    return apiError(e);
  }
}
