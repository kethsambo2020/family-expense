export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function json(data, init) {
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
}
