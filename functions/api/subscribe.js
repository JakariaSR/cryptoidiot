// Newsletter subscribe endpoint — runs as a Cloudflare Pages Function.
// Stores each email in a KV namespace bound as EMAILS.
//
// Setup (one time, in Cloudflare):
//   1. Workers & Pages → KV → Create namespace, e.g. "cryptoidiot-emails"
//   2. Pages → your project → Settings → Functions → KV namespace bindings
//      → Variable name: EMAILS → Namespace: cryptoidiot-emails
//
// View/export subscribers later:
//   Dashboard → KV → cryptoidiot-emails  (key = email, value = subscribed-at)

export async function onRequestPost(context) {
  const { request, env } = context;

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
    source: "cryptoidiot.com"
  }));

  return json({ ok: true, message: "You're on the list! Welcome aboard. 🚀" });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204 });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
