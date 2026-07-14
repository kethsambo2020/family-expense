import { json } from "../../_utils.js";

// PUT /api/users/:id  -> update username / display name / (optional) password
export async function onRequestPut({ env, request, params }) {
  const data = await request.json();
  const fields = [];
  const values = [];
  if (data.username !== undefined) { fields.push("username = ?"); values.push(data.username); }
  if (data.name !== undefined) { fields.push("name = ?"); values.push(data.name); }
  if (data.password) { fields.push("password = ?"); values.push(data.password); }
  if (fields.length === 0) return json({ ok: true });
  values.push(params.id);
  await env.DB.prepare(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`).bind(...values).run();
  return json({ ok: true });
}

// DELETE /api/users/:id
export async function onRequestDelete({ env, params }) {
  await env.DB.prepare("DELETE FROM users WHERE id = ?").bind(params.id).run();
  return json({ ok: true });
}
