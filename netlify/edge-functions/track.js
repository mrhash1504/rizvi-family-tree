/* Record a page view.
 *
 * Runs at Netlify's edge so the country comes from the request itself. The
 * alternative — asking a third-party geolocation API from the browser — would
 * mean handing every visitor's IP address to a company nobody in the family
 * has heard of, to answer a question that does not need it.
 *
 * The IP is never read here and never stored. Netlify resolves it to a
 * country before this function runs, and only the country is kept.
 */

export default async (request, context) => {
  if (request.method !== 'POST') {
    return new Response('method not allowed', { status: 405 });
  }

  let body = {};
  try { body = await request.json(); } catch (_) { /* treat as empty */ }

  /* Environment variables win, so the keys can be rotated in the Netlify UI
   * without a deploy. The fallbacks are the same values already shipped in
   * assets/config.js and served to every visitor — the publishable key is
   * public by design and is not a secret. Anything that IS secret (the
   * service_role key) must never appear here. */
  const url = Deno.env.get('SUPABASE_URL') || 'https://rwseryuxuvrcoddntnho.supabase.co';
  const key = Deno.env.get('SUPABASE_ANON_KEY') || 'sb_publishable_ZRb6ga-P_M0TRJE8pegoFw_deK5yUHU';

  // Leave crawlers out; they would swamp a family site's numbers.
  const ua = (request.headers.get('user-agent') || '').toLowerCase();
  if (/bot|crawler|spider|crawling|preview|monitor|curl|wget|headless/.test(ua)) {
    return new Response(null, { status: 204 });
  }

  const clip = (s, n) => String(s == null ? '' : s).slice(0, n);

  // Referrer host only. The full URL can carry search terms and the path
  // someone came from, which is more than a visit counter needs.
  let referrer = '';
  try {
    const r = request.headers.get('referer');
    if (r) {
      const h = new URL(r).hostname;
      if (h && h !== new URL(request.url).hostname) referrer = h;
    }
  } catch (_) { /* malformed referrer */ }

  const row = {
    path: clip(body.path, 120),
    country: clip(context.geo?.country?.code || '', 2),
    device: /mobile|android|iphone|ipad/.test(ua) ? 'mobile' : 'desktop',
    referrer: clip(referrer, 120),
    session: clip(body.session, 40)
  };

  try {
    await fetch(`${url}/rest/v1/visits`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(row)
    });
  } catch (_) {
    // A statistics failure is never worth surfacing to a visitor.
  }

  return new Response(null, { status: 204 });
};

export const config = { path: '/api/track' };
