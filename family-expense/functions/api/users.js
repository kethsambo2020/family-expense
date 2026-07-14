import { uid, json } from "../_utils.js";

// GET /api/users  -> list all family accounts
export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    "SELECT id, username, password, name, role, created_at AS createdAt FROM users ORDER BY created_at ASC"
  ).all();
  return json(results);
}

// POST /api/users  -> create a new account (admin during setup, or member added by admin)
export async function onRequestPost({ env, request }) {
  const data = await request.json();
  if (!data.username || !data.password || !data.role) {
    return json({ error: "username, password and role are required" }, { status: 400 });
  }
  const id = uid();
  const createdAt = Date.now();
  try {
    await env.DB.prepare(
      "INSERT INTO users (id, username, password, name, role, created_at) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(id, data.username, data.password, data.name || data.username, data.role, createdAt).run();
  } catch (e) {
    return json({ error: "username already taken" }, { status: 409 });
  }
  return json({ id, username: data.username, name: data.name || data.username, role: data.role, createdAt });
}
