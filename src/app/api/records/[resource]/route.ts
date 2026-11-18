import { requireUser, AuthError } from "../../../../lib/supabase/server";
import { apiError, json, bodyJSON, checkOrigin, rateLimit } from "../../../../lib/http";
import { resourceSchemas, type Resource } from "../../../../lib/schema";
import { z } from "zod";
const envelope = z
  .object({ id: z.uuid().optional(), payload: z.unknown() })
  .strict();
async function context(params: Promise<{ resource: string }>) {
  const { resource } = await params;
  if (!Object.hasOwn(resourceSchemas, resource))
    throw new AuthError("Resource tidak dikenal.", 404);
  return resource as Resource;
}
export async function POST(
  req: Request,
  { params }: { params: Promise<{ resource: string }> },
) {
  try {
    checkOrigin(req);
    const resource = await context(params),
      { db, user } = await requireUser();
    await rateLimit(user.id, "write");
    const body = envelope.parse(await bodyJSON(req));
    const payload = resourceSchemas[resource].parse(body.payload);
    const id = body.id ?? crypto.randomUUID();
    if (resource === "transactions") {
      const { data, error } = await db.rpc("write_transaction", {
        p_id: id,
        p_payload: payload,
        p_delete: false,
      });
      if (error) throw new Error(error.message);
      return json(data);
    }
    const { data, error } = await db
      .from(resource)
      .upsert({ id, user_id: user.id, payload })
      .select("id,payload,created_at")
      .single();
    if (error)
      throw new Error("Gagal menyimpan. Periksa hak akses dan struktur data.");
    return json(data);
  } catch (e) {
    return apiError(e);
  }
}
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ resource: string }> },
) {
  try {
    checkOrigin(req);
    const resource = await context(params),
      { db, user } = await requireUser();
    await rateLimit(user.id, "write");
    const body = z
      .object({ id: z.uuid() })
      .strict()
      .parse(await bodyJSON(req));
    if (resource === "transactions") {
      const { error } = await db.rpc("write_transaction", {
        p_id: body.id,
        p_payload: {},
        p_delete: true,
      });
      if (error) throw new Error(error.message);
    } else {
      const { error } = await db
        .from(resource)
        .delete()
        .eq("id", body.id)
        .eq("user_id", user.id);
      if (error) throw new Error("Gagal menghapus.");
    }
    return json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
