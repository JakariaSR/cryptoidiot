// Worker entry: serves static assets from [assets] (dist/) and handles /api/* routes.
// Newsletter emails are stored in a KV namespace bound as EMAILS.

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/subscribe") {
      return handleSubscribe(request, env);
    }

    // Everything else → static site (dist/)
    return env.ASSETS.fetch(request);
  },
};

async function handleSubscribe(request, env) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204 });
  if (request.method !== "POST") return json({ ok: false, error: "Method not allowed." }, 405);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid request." }, 400);
  }

  const email = String(body.email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return json({ ok: false, error: "That doesn't look like a valid email address." }, 400);
  }

  if (!env.EMAILS) {
    return json(
      { ok: false, error: "Subscription storage is not configured yet. Please try again later." },
      500
    );
  }

  const existing = await env.EMAILS.get(email);
  if (existing) {
    return json({ ok: true, message: "You're already on the list! 🎉" });
  }

  await env.EMAILS.put(email, JSON.stringify({
    email,
    subscribedAt: new Date().toISOString(),
    source: "cryptoidiot.com",
  }));

  return json({ ok: true, message: "You're on the list! Welcome aboard. 🚀" });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
