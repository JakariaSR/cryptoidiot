// GitHub OAuth — step 1: redirect the browser to GitHub's authorize page.
// Env vars needed (Pages → Settings → Environment variables):
//   GITHUB_CLIENT_ID     from your GitHub OAuth App
//   GITHUB_CLIENT_SECRET from your GitHub OAuth App

export async function onRequestGet(context) {
  const clientId = context.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return new Response("GITHUB_CLIENT_ID is not configured.", { status: 500 });
  }
  const redirectUri = "https://cryptoidiot.com/api/callback";
  const url =
    "https://github.com/login/oauth/authorize" +
    "?client_id=" + encodeURIComponent(clientId) +
    "&redirect_uri=" + encodeURIComponent(redirectUri) +
    "&scope=repo";
  return Response.redirect(url, 302);
}
