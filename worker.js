/* =========================================================================
   family-expense Worker
   - Serves the static app (public/index.html) via env.ASSETS
   - Handles /api/users, /api/entries, /api/categories against D1 (env.DB)
   ========================================================================= */

function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
}
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      try {
        return await handleApi(request, env, url);
      } catch (err) {
        return json({ error: String(err) }, { status: 500 });
      }
    }
    return env.ASSETS.fetch(request);
  },
};

async function handleApi(request, env, url) {
  const parts = url.pathname.split("/").filter(Boolean); // ["api", "users", ":id?"]
  const resource = parts[1];
  const id = parts[2];
  const method = request.method;

  if (resource === "users") {
    if (!id) {
      if (method === "GET") return listUsers(env);
      if (method === "POST") return createUser(request, env);
    } else {
      if (method === "PUT") return updateUser(request, env, id);
      if (method === "DELETE") return deleteUser(env, id);
    }
  }

  if (resource === "entries") {
    if (!id) {
      if (method === "GET") return listEntries(env);
      if (method === "POST") return createEntry(request, env);
    } else {
      if (method === "PUT") return updateEntry(request, env, id);
      if (method === "DELETE") return deleteEntry(env, id);
    }
  }

  if (resource === "categories") {
    if (method === "GET") return listCategories(env);
    if (method === "POST") return createCategory(request, env);
  }

  return json({ error: "not found" }, { status: 404 });
}

/* ---- users ---- */
async function listUsers(env) {
  const { results } = await env.DB.prepare(
    "SELECT id, username, password, name, role, created_at AS createdAt FROM users ORDER BY created_at ASC"
  ).all();
  return json(results);
}
async function createUser(request, env) {
  const data = await request.json();
  if (!data.username || !data.password || !data.role) {
    return json({ error: "missing fields" }, { status: 400 });
  }
  const id = uid();
  const createdAt = Date.now();
  try {
    await env.DB.prepare(
      "INSERT INTO users (id, username, password, name, role, created_at) VALUES (?,?,?,?,?,?)"
    ).bind(id, data.username, data.password, data.name || data.username, data.role, createdAt).run();
  } catch (e) {
    return json({ error: "username already taken" }, { status: 409 });
  }
  return json({ id, username: data.username, name: data.name || data.username, role: data.role, createdAt });
}
async function updateUser(request, env, id) {
  const data = await request.json();
  const fields = [];
  const values = [];
  if (data.username !== undefined) { fields.push("username = ?"); values.push(data.username); }
  if (data.name !== undefined) { fields.push("name = ?"); values.push(data.name); }
  if (data.password) { fields.push("password = ?"); values.push(data.password); }
  if (fields.length === 0) return json({ ok: true });
  values.push(id);
  await env.DB.prepare(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`).bind(...values).run();
  return json({ ok: true });
}
async function deleteUser(env, id) {
  await env.DB.prepare("DELETE FROM users WHERE id = ?").bind(id).run();
  return json({ ok: true });
}

/* ---- entries ---- */
async function listEntries(env) {
  const { results } = await env.DB.prepare(
    `SELECT id, type, amount, currency, category, date, member, note,
            created_by_name AS createdByName, created_by_user_id AS createdByUserId,
            created_at AS createdAt
     FROM entries ORDER BY created_at DESC`
  ).all();
  return json(results);
}
async function createEntry(request, env) {
  const data = await request.json();
  if (!data.type || !data.amount || !data.currency || !data.category || !data.date) {
    return json({ error: "missing fields" }, { status: 400 });
  }
  const id = uid();
  const createdAt = Date.now();
  await env.DB.prepare(
    `INSERT INTO entries (id, type, amount, currency, category, date, member, note, created_by_name, created_by_user_id, created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`
  ).bind(
    id, data.type, data.amount, data.currency, data.category, data.date,
    data.member || "", data.note || "", data.createdByName || "", data.createdByUserId || "", createdAt
  ).run();
  return json({ id, ...data, createdAt });
}
async function updateEntry(request, env, id) {
  const data = await request.json();
  const allowed = ["type", "amount", "currency", "category", "date", "member", "note"];
  const fields = [];
  const values = [];
  for (const k of allowed) {
    if (data[k] !== undefined) { fields.push(`${k} = ?`); values.push(data[k]); }
  }
  if (fields.length === 0) return json({ ok: true });
  values.push(id);
  await env.DB.prepare(`UPDATE entries SET ${fields.join(", ")} WHERE id = ?`).bind(...values).run();
  return json({ ok: true });
}
async function deleteEntry(env, id) {
  await env.DB.prepare("DELETE FROM entries WHERE id = ?").bind(id).run();
  return json({ ok: true });
}

/* ---- categories ---- */
async function listCategories(env) {
  const { results } = await env.DB.prepare("SELECT id, icon, en, kh, color FROM categories").all();
  return json(results);
}
async function createCategory(request, env) {
  const data = await request.json();
  if (!data.id || !data.en) return json({ error: "missing fields" }, { status: 400 });
  await env.DB.prepare(
    "INSERT OR REPLACE INTO categories (id, icon, en, kh, color) VALUES (?,?,?,?,?)"
  ).bind(data.id, data.icon || "🏷️", data.en, data.kh || data.en, data.color || "#7A6A4A").run();
  return json(data);
}
