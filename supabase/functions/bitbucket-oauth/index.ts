/**
 * Supabase Edge Function: Bitbucket OAuth 2.0 token exchange & refresh.
 *
 * Actions:
 *   exchange  — swap authorization code for tokens + fetch workspace info
 *   refresh   — swap refresh_token for new access_token
 */

// @ts-expect-error Deno runtime
const serve = Deno.serve ?? ((handler: (req: Request) => Promise<Response>) => handler);

const BITBUCKET_TOKEN_URL = 'https://bitbucket.org/site/oauth2/access_token';
const BITBUCKET_API = 'https://api.bitbucket.org/2.0';

// @ts-expect-error Deno runtime
const CLIENT_ID = Deno.env.get('BITBUCKET_CLIENT_ID') ?? '';
// @ts-expect-error Deno runtime
const CLIENT_SECRET = Deno.env.get('BITBUCKET_CLIENT_SECRET') ?? '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/** Bitbucket uses HTTP Basic Auth for token requests */
function basicAuthHeader(): string {
  return 'Basic ' + btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, code, redirect_uri, refresh_token } = await req.json();

    if (action === 'exchange') {
      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri,
      });

      const tokenRes = await fetch(BITBUCKET_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: basicAuthHeader(),
        },
        body: body.toString(),
      });

      const tokens = await tokenRes.json();
      if (!tokenRes.ok) {
        return new Response(JSON.stringify({ error: tokens }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Fetch user info
      const userRes = await fetch(`${BITBUCKET_API}/user`, {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      const user = await userRes.json();

      // Fetch workspaces
      const wsRes = await fetch(`${BITBUCKET_API}/workspaces?pagelen=100`, {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      const wsData = await wsRes.json();
      const workspaces: { slug: string; name: string }[] = wsData.values ?? [];

      return new Response(JSON.stringify({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in,
        username: user.username ?? user.account_id,
        display_name: user.display_name,
        account_id: user.account_id,
        workspace_count: workspaces.length,
        primary_workspace: workspaces[0]?.slug ?? user.username,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'refresh') {
      const body = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token,
      });

      const tokenRes = await fetch(BITBUCKET_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: basicAuthHeader(),
        },
        body: body.toString(),
      });

      const tokens = await tokenRes.json();
      if (!tokenRes.ok) {
        return new Response(JSON.stringify({ error: tokens }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token ?? refresh_token,
        expires_in: tokens.expires_in,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action. Use "exchange" or "refresh".' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
