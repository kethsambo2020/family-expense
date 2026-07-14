import { uid, json } from "../_utils.js";

// GET /api/entries  -> list all income/expense entries (shared across the family)
export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    `SELECT id, type, amount, currency, category, date, member, note,
            created_by_name AS createdByName, created_by_user_id AS createdByUserId,
            created_at AS createdAt
     FROM entries ORDER BY created_at DESC`
  ).all();
  return json(results);
}

// POST /api/entries  -> add a new entry
export async function onRequestPost({ env, request }) {
  const data = await request.json();
  if (!data.type || !data.amount || !data.currency || !data.category || !data.date) {
    return json({ error: "missing required fields" }, { status: 400 });
  }
  const id = uid();
  const createdAt = Date.now();
  await env.DB.prepare(
    `INSERT INTO entries (id, type, amount, currency, category, date, member, note, created_by_name, created_by_user_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id, data.type, data.amount, data.currency, data.category, data.date,
    data.member || "", data.note || "", data.createdByName || "", data.createdByUserId || "", createdAt
  ).run();
  return json({ id, ...data, createdAt });
}
