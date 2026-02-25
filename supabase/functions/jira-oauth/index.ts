/**
 * Supabase Edge Function: Jira OAuth 2.0 (3LO) token exchange & refresh.
 *
 * Actions:
 *   exchange  — swap authorization code for tokens + fetch cloud_id
 *   refresh   — swap refresh_token for new access_token
 */

// @ts-expect-error Deno runtime
const serve = Deno.serve ?? ((handler: (req: Request) => Promise<Response>) => handler);

const JIRA_TOKEN_URL = 'https://auth.atlassian.com/oauth/token';
const ACCESSIBLE_RESOURCES_URL = 'https://api.atlassian.com/oauth/token/accessible-resources';

// @ts-expect-error Deno runtime
const CLIENT_ID = Deno.env.get('JIRA_CLIENT_ID') ?? '';
// @ts-expect-error Deno runtime
const CLIENT_SECRET = Deno.env.get('JIRA_CLIENT_SECRET') ?? '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, code, redirect_uri, refresh_token } = await req.json();

    if (action === 'exchange') {
      // Exchange authorization code for tokens
      const tokenRes = await fetch(JIRA_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code,
          redirect_uri,
        }),
      });

      const tokens = await tokenRes.json();
      if (!tokenRes.ok) {
        return new Response(JSON.stringify({ error: tokens }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Fetch accessible resources to get cloud_id and site info
      const resourcesRes = await fetch(ACCESSIBLE_RESOURCES_URL, {
        headers: { Authorization: `Bearer ${tokens.access_token}`, Accept: 'application/json' },
      });
      const sites = await resourcesRes.json();

      if (!Array.isArray(sites) || sites.length === 0) {
        return new Response(JSON.stringify({ error: 'No accessible Jira sites found' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const site = sites[0];

      return new Response(JSON.stringify({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in,
        cloud_id: site.id,
        site_name: site.name,
        site_url: site.url,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'refresh') {
      const tokenRes = await fetch(JIRA_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'refresh_token',
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          refresh_token,
        }),
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
