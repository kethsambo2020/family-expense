import { json } from "../../_utils.js";

const ALLOWED_FIELDS = ["type", "amount", "currency", "category", "date", "member", "note"];

// PUT /api/entries/:id  -> update an entry
export async function onRequestPut({ env, request, params }) {
  const data = await request.json();
  const fields = [];
  const values = [];
  for (const key of ALLOWED_FIELDS) {
    if (data[key] !== undefined) { fields.push(`${key} = ?`); values.push(data[key]); }
  }
  if (fields.length === 0) return json({ ok: true });
  values.push(params.id);
  await env.DB.prepare(`UPDATE entries SET ${fields.join(", ")} WHERE id = ?`).bind(...values).run();
  return json({ ok: true });
}

// DELETE /api/entries/:id
export async function onRequestDelete({ env, params }) {
  await env.DB.prepare("DELETE FROM entries WHERE id = ?").bind(params.id).run();
  return json({ ok: true });
}
