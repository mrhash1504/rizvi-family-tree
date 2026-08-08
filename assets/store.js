/* Data layer.
 *
 * Two backends behind one interface:
 *   supabase — live, shared, what relatives actually use
 *   local    — browser storage, used when config.js is blank so the site is
 *              never broken and can be demoed before setup
 *
 * Talks to Supabase over its REST endpoint with plain fetch. No SDK, no
 * build step, no CDN dependency.
 */

const Store = (() => {
  const cfg = window.RFT_CONFIG || {};
  const live = !!(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY);
  const base = live ? cfg.SUPABASE_URL.replace(/\/$/, '') : '';
  const LS_PEOPLE = 'rft-people';
  const LS_VERSION = 'rft-seed-version';
  const LS_SUGGESTIONS = 'rft-suggestions';
  const LS_TOKEN = 'rft-token';

  const LS_REFRESH = 'rft-refresh';
  const LS_EXPIRES = 'rft-expires';

  let token = null, refreshToken = null, expiresAt = 0;
  try {
    token = localStorage.getItem(LS_TOKEN);
    refreshToken = localStorage.getItem(LS_REFRESH);
    expiresAt = Number(localStorage.getItem(LS_EXPIRES) || 0);
  } catch (e) { /* private mode */ }

  function saveSession(data) {
    token = data.access_token;
    refreshToken = data.refresh_token || refreshToken;
    // expires_in is seconds from now. Keep a little headroom so we renew
    // before a request can fail rather than after.
    expiresAt = Date.now() + ((data.expires_in || 3600) * 1000);
    try {
      localStorage.setItem(LS_TOKEN, token);
      if (refreshToken) localStorage.setItem(LS_REFRESH, refreshToken);
      localStorage.setItem(LS_EXPIRES, String(expiresAt));
    } catch (e) { /* private mode */ }
  }

  function clearSession() {
    token = refreshToken = null;
    expiresAt = 0;
    try {
      [LS_TOKEN, LS_REFRESH, LS_EXPIRES].forEach(k => localStorage.removeItem(k));
    } catch (e) { /* private mode */ }
  }

  /* Supabase access tokens last an hour. Without this the admin panel quietly
   * stops working partway through a review session, with no clue as to why. */
  let refreshing = null;
  async function ensureFreshToken() {
    if (!live || !token || !refreshToken) return;
    if (Date.now() < expiresAt - 60000) return;      // still good
    if (refreshing) return refreshing;               // one renewal at a time

    refreshing = (async () => {
      try {
        const res = await fetch(base + '/auth/v1/token?grant_type=refresh_token', {
          method: 'POST',
          headers: { apikey: cfg.SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken })
        });
        if (!res.ok) { clearSession(); return; }
        saveSession(await res.json());
      } catch (e) {
        // Offline. Keep the session as-is so a retry can still work.
      } finally {
        refreshing = null;
      }
    })();
    return refreshing;
  }

  function headers(extra) {
    const h = Object.assign({
      apikey: cfg.SUPABASE_ANON_KEY,
      Authorization: 'Bearer ' + (token || cfg.SUPABASE_ANON_KEY),
      'Content-Type': 'application/json'
    }, extra || {});
    return h;
  }

  async function rest(path, opts, _retried) {
    await ensureFreshToken();

    // opts must be spread FIRST and headers applied last. The other way round,
    // any caller passing its own header (upsertPerson sends Prefer) replaces
    // the whole headers object, dropping apikey and Authorization — the
    // request then leaves unauthenticated and Supabase rejects it at the
    // gateway with 401, before it ever reaches Postgres.
    const init = Object.assign({}, opts, { headers: headers(opts && opts.headers) });
    const res = await fetch(base + '/rest/v1/' + path, init);

    // A 401 while signed in usually means the token died between the check
    // above and this request. Renew once and retry before bothering the user.
    if (res.status === 401 && token && refreshToken && !_retried) {
      expiresAt = 0;
      await ensureFreshToken();
      if (token) return rest(path, opts, true);
    }
    if (!res.ok) {
      // Keep the status and PostgREST's own message on the error object.
      // Flattening it all into one string, as this used to, meant no caller
      // could tell "you are not allowed" from "the network is down".
      const body = await res.text();
      let detail = body, code = null;
      try {
        const j = JSON.parse(body);
        detail = j.message || j.details || j.hint || body;
        code = j.code || null;
      } catch (e) { /* not JSON; keep the raw text */ }

      const err = new Error('supabase ' + res.status + ': ' + detail);
      err.status = res.status;
      err.detail = detail;
      err.code = code;
      throw err;
    }
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  }

  /* ── local-mode helpers ─────────────────────────────────────────────── */
  function lsGet(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function lsSet(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* quota / private mode */ }
  }
  function localPeople() {
    const stored = lsGet(LS_PEOPLE, null);
    const storedVersion = lsGet(LS_VERSION, 0);
    // Re-seed when the record shape has changed under a returning visitor.
    if (stored && stored.length && storedVersion === window.SEED_VERSION) return stored;
    const seeded = window.SEED_PEOPLE.map(p => Object.assign({}, p));
    lsSet(LS_PEOPLE, seeded);
    lsSet(LS_VERSION, window.SEED_VERSION);
    return seeded;
  }

  function uid() {
    return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  return {
    isLive: live,
    get isAdmin() { return !!token; },

    /* ── reads ────────────────────────────────────────────────────────── */

    async getPeople() {
      if (!live) return localPeople();
      try {
        const rows = await rest('people?select=*&order=sort_order.asc');
        return rows.length ? rows : window.SEED_PEOPLE.map(p => Object.assign({}, p));
      } catch (e) {
        // Falling back silently is fine for a visitor — better a readable
        // tree than an error page. It is NOT fine for the admin, who could
        // otherwise review and approve against stale data without knowing.
        if (token) throw e;
        console.warn('Falling back to seed data:', e.message);
        return window.SEED_PEOPLE.map(p => Object.assign({}, p));
      }
    },

    /* { personId: count } of suggestions awaiting review, for the public dots.
     * Live mode reads the counter cached on each person by the
     * suggestions_count trigger, so this costs no extra request. */
    async getPendingCounts() {
      if (!live) {
        const out = {};
        lsGet(LS_SUGGESTIONS, []).filter(s => s.status === 'pending')
          .forEach(s => { out[s.person_id] = (out[s.person_id] || 0) + 1; });
        return out;
      }
      try {
        const rows = await rest('people?select=id,pending_count&pending_count=gt.0');
        const out = {};
        rows.forEach(r => { out[r.id] = r.pending_count; });
        return out;
      } catch (e) { return {}; }
    },

    /* ── writes from relatives ────────────────────────────────────────── */

    /* changes: [{ field, old_value, new_value }] */
    async submitSuggestions(personId, personName, changes, author, relation, isNewPerson, parentId) {
      const rows = changes.map(c => ({
        person_id: personId,
        person_name: personName,
        parent_id: parentId || null,
        is_new_person: !!isNewPerson,
        field: c.field,
        old_value: c.old_value || '',
        new_value: c.new_value,
        author: author,
        relation: relation || '',
        status: 'pending',
        created_at: new Date().toISOString()
      }));

      if (!live) {
        const all = lsGet(LS_SUGGESTIONS, []);
        rows.forEach((r, i) => all.push(Object.assign({ id: Date.now() + i }, r)));
        lsSet(LS_SUGGESTIONS, all);
        return rows.length;
      }
      await rest('suggestions', { method: 'POST', body: JSON.stringify(rows) });
      return rows.length;
    },

    /* ── admin ────────────────────────────────────────────────────────── */

    async signIn(email, password) {
      if (!live) { token = 'local-admin'; lsSet(LS_TOKEN, token); return true; }
      const res = await fetch(base + '/auth/v1/token?grant_type=password', {
        method: 'POST',
        headers: { apikey: cfg.SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) return false;
      saveSession(await res.json());
      return true;
    },

    signOut() {
      clearSession();
    },

    /* True when we hold a token that is past its life and cannot be renewed.
     * The admin panel uses this to send the owner back to the sign-in form
     * rather than showing an empty screen. */
    get sessionExpired() {
      return !!(live && token && !refreshToken && Date.now() >= expiresAt);
    },

    async getPending() {
      if (!live) return lsGet(LS_SUGGESTIONS, []).filter(s => s.status === 'pending');
      return rest('suggestions?status=eq.pending&select=*&order=created_at.asc');
    },

    /* Every suggestion ever filed, whatever its status — for the backup file.
     * Rejected rows are kept deliberately: "we already decided that" is worth
     * being able to look up years later. */
    async getAllSuggestions() {
      if (!live) return lsGet(LS_SUGGESTIONS, []);
      return rest('suggestions?select=*&order=created_at.asc');
    },

    /* Turn a REST failure into something the admin can act on. "Check your
     * connection" is actively misleading when the server answered promptly
     * with 401 — it sends you to look at your wifi instead of your database. */
    describeError(e) {
      const s = e && e.status;
      // An expired session is the one 401 the admin can fix themselves.
      if (s === 401 && e.code === 'PGRST301') return I18N.t('errExpired');
      if (s === 401 || s === 403)             return I18N.t('errPermission');
      if (s)                                  return I18N.t('errServer', s, (e.detail || '').slice(0, 200));
      return I18N.t('errNetwork');
    },

    async setSuggestionStatus(id, status) {
      if (!live) {
        const all = lsGet(LS_SUGGESTIONS, []);
        const row = all.find(s => String(s.id) === String(id));
        if (row) row.status = status;
        lsSet(LS_SUGGESTIONS, all);
        return;
      }
      await rest('suggestions?id=eq.' + encodeURIComponent(id), {
        method: 'PATCH',
        body: JSON.stringify({ status, reviewed_at: new Date().toISOString() })
      });
    },

    /* patch: partial person record. Creates the row if it does not exist. */
    async upsertPerson(personId, patch, parentId) {
      if (!live) {
        const people = localPeople();
        let p = people.find(x => x.id === personId);
        if (!p) {
          p = Object.assign({
            id: personId, parent: parentId || null, name: '', name_ur: '',
            birth: '', death: '', birthplace: '', residence: '',
            spouse: '', spouse_ur: '', notes: '', notes_ur: '',
            tag: 'confirmed', locked: []
          }, patch);
          people.push(p);
        } else {
          Object.assign(p, patch);
        }
        lsSet(LS_PEOPLE, people);
        return p;
      }

      const existing = await rest('people?id=eq.' + encodeURIComponent(personId) + '&select=id');
      if (existing.length) {
        return rest('people?id=eq.' + encodeURIComponent(personId), {
          method: 'PATCH',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify(patch)
        });
      }
      return rest('people', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify(Object.assign({
          id: personId, parent: parentId || null, tag: 'confirmed', locked: []
        }, patch))
      });
    },

    async setLocked(personId, lockedFields) {
      return this.upsertPerson(personId, { locked: lockedFields });
    },

    newId: uid,

    /* Local mode only — lets the owner start over from the document. */
    resetLocal() {
      try {
        localStorage.removeItem(LS_PEOPLE);
        localStorage.removeItem(LS_VERSION);
        localStorage.removeItem(LS_SUGGESTIONS);
      } catch (e) { /* private mode */ }
    }
  };
})();

window.Store = Store;
