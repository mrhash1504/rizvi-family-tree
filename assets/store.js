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

  let token = null;
  try { token = localStorage.getItem(LS_TOKEN); } catch (e) { /* private mode */ }

  function headers(extra) {
    const h = Object.assign({
      apikey: cfg.SUPABASE_ANON_KEY,
      Authorization: 'Bearer ' + (token || cfg.SUPABASE_ANON_KEY),
      'Content-Type': 'application/json'
    }, extra || {});
    return h;
  }

  async function rest(path, opts) {
    const res = await fetch(base + '/rest/v1/' + path, Object.assign({ headers: headers(opts && opts.headers) }, opts));
    if (!res.ok) throw new Error('supabase ' + res.status + ' ' + (await res.text()));
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
      const data = await res.json();
      token = data.access_token;
      try { localStorage.setItem(LS_TOKEN, token); } catch (e) { /* private mode */ }
      return true;
    },

    signOut() {
      token = null;
      try { localStorage.removeItem(LS_TOKEN); } catch (e) { /* private mode */ }
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
