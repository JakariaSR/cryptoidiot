// GitHub OAuth — step 2: exchange the code for a token and hand it back
// to Decap CMS via postMessage.

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const code = url.searchParams.get("code");
  if (!code) {
    return new Response("Missing ?code= parameter.", { status: 400 });
  }

  const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = context.env;
  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    return new Response("GitHub OAuth env vars are not configured.", { status: 500 });
  }

  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code,
    }),
  });
  const data = await res.json();

  if (!data.access_token) {
    return new Response("GitHub token exchange failed: " + JSON.stringify(data), { status: 502 });
  }

  // Decap expects this exact postMessage format.
  const payload = "authorization:github:success:" + JSON.stringify({ token: data.access_token });
  const html =
    "<!DOCTYPE html><html><body><script>" +
    'window.opener && window.opener.postMessage(' + JSON.stringify(payload) + ', "*");' +
    "window.close();" +
    "</script><p>You can close this tab.</p></body></html>";

  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
