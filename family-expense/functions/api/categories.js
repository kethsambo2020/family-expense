import { json } from "../_utils.js";

// GET /api/categories  -> list custom categories added by the family
export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    "SELECT id, icon, en, kh, color FROM categories"
  ).all();
  return json(results);
}

// POST /api/categories  -> add a custom category
export async function onRequestPost({ env, request }) {
  const data = await request.json();
  if (!data.id || !data.en) return json({ error: "id and en are required" }, { status: 400 });
  await env.DB.prepare(
    "INSERT OR REPLACE INTO categories (id, icon, en, kh, color) VALUES (?, ?, ?, ?, ?)"
  ).bind(data.id, data.icon || "🏷️", data.en, data.kh || data.en, data.color || "#7A6A4A").run();
  return json(data);
}
