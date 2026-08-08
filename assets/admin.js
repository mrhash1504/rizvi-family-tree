/* Owner-only review queue: approve, reject, and lock. */

(() => {
  const $ = sel => document.querySelector(sel);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const ICON = {
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
    unlock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 7.5-2"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m4 12 5.5 5.5L20 7"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>'
  };

  const state = { people: [], byId: new Map(), pending: [] };

  /* The en/ur twins share a label, so mark which half a row refers to. */
  const fieldLabel = f => I18N.label(f) + (f.endsWith('_ur') ? ' · ' + I18N.t('inUrdu') : '');

  let toastTimer;
  function toast(msg, bad) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.toggle('bad', !!bad);
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 3600);
  }

  /* Suggestions arrive one row per field. Group them so a relative who filled
   * in four fields at once is reviewed as a single submission. */
  function groupPending(rows) {
    const groups = new Map();
    rows.forEach(r => {
      const key = r.person_id + '|' + r.author + '|' + String(r.created_at).slice(0, 16);
      if (!groups.has(key)) {
        groups.set(key, {
          key,
          person_id: r.person_id,
          person_name: r.person_name,
          parent_id: r.parent_id,
          is_new_person: r.is_new_person,
          author: r.author,
          relation: r.relation,
          created_at: r.created_at,
          rows: []
        });
      }
      groups.get(key).rows.push(r);
    });
    return [...groups.values()];
  }

  function when(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return isNaN(d) ? '' : d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function renderQueue() {
    const groups = groupPending(state.pending);
    const host = $('#queueHost');

    document.querySelector('#adminTabs .tab[data-pane="queue"]').innerHTML =
      esc(I18N.t('adminTitle')) + (groups.length ? `<span class="count">${groups.length}</span>` : '');

    if (!groups.length) {
      host.innerHTML = `<p class="empty-state">${esc(I18N.t('adminNoPending'))}</p>`;
      return;
    }

    host.innerHTML = groups.map(g => {
      const existing = state.byId.get(g.person_id);
      const displayName = existing ? existing.name : (g.person_name || '—');
      const parent = g.parent_id && state.byId.get(g.parent_id);

      const diffs = g.rows.map(r => `<div class="diff-row">
        <span class="k">${esc(fieldLabel(r.field))}</span>
        <span class="old" ${r.old_value ? '' : 'hidden'}>${esc(r.old_value)}</span>
        <span class="new" data-script="${r.field.endsWith('_ur') ? 'ur' : 'en'}">${esc(r.new_value) || `<i>${esc(I18N.t('adminEmpty'))}</i>`}</span>
      </div>`).join('');

      return `<article class="sugg" data-key="${esc(g.key)}">
        <div class="sugg-head">
          <strong>${esc(displayName)}</strong>
          ${g.is_new_person ? `<span class="chip-tag tag-estimated">${esc(I18N.t('adminNewPerson'))}</span>` : ''}
          ${parent ? `<span class="chip-tag tag-shajra">${esc(I18N.t('relationshipTo'))} ${esc(parent.name)}</span>` : ''}
          <span class="who">${esc(I18N.t('adminSuggestedBy'))} <b>${esc(g.author)}</b>${g.relation ? ' · ' + esc(g.relation) : ''}${g.created_at ? ' · ' + esc(when(g.created_at)) : ''}</span>
        </div>
        <div class="diff">${diffs}</div>
        <div class="sugg-actions">
          <button class="btn btn-sm btn-primary" style="flex:none" type="button" data-do="approve">${ICON.check}<span>${esc(I18N.t('adminApprove'))}</span></button>
          <button class="btn btn-sm btn-ghost" type="button" data-do="approve-lock">${ICON.lock}<span>${esc(I18N.t('adminApproveLock'))}</span></button>
          <button class="btn btn-sm btn-danger" type="button" data-do="reject">${ICON.x}<span>${esc(I18N.t('adminReject'))}</span></button>
        </div>
      </article>`;
    }).join('');
  }

  async function act(key, what) {
    const g = groupPending(state.pending).find(x => x.key === key);
    if (!g) return;

    const card = document.querySelector(`.sugg[data-key="${CSS.escape(key)}"]`);
    card.querySelectorAll('button').forEach(b => { b.disabled = true; });

    try {
      if (what === 'reject') {
        for (const r of g.rows) await Store.setSuggestionStatus(r.id, 'rejected');
      } else {
        const patch = {};
        g.rows.forEach(r => { patch[r.field] = r.new_value; });

        if (what === 'approve-lock') {
          const existing = state.byId.get(g.person_id);
          const already = (existing && Array.isArray(existing.locked)) ? existing.locked : [];
          patch.locked = [...new Set([...already, ...g.rows.map(r => r.field)])];
        }

        await Store.upsertPerson(g.person_id, patch, g.parent_id);
        for (const r of g.rows) await Store.setSuggestionStatus(r.id, 'approved');
      }

      await refresh();
      toast(what === 'reject' ? I18N.t('adminReject') + ' ✓' : I18N.t('adminApprove') + ' ✓');
    } catch (e) {
      console.error(e);
      card.querySelectorAll('button').forEach(b => { b.disabled = false; });
      // Say what actually went wrong. The suggestion is still safely in the
      // queue either way — nothing has been lost, only not yet applied.
      toast(Store.describeError(e), true);
    }
  }

  /* ── decided history ────────────────────────────────────────────────
   * The queue deliberately shows only what is still pending, so once you
   * approve or reject something it leaves the list. Nothing is deleted
   * though, and "what did we decide about that, and when?" is a fair
   * question years later — so this shows the decided ones. */

  async function renderHistory() {
    const host = $('#historyHost');
    host.innerHTML = `<p class="empty-state">${esc(I18N.t('adminHistoryLoading'))}</p>`;

    let rows;
    try {
      rows = (await Store.getAllSuggestions()).filter(s => s.status !== 'pending');
    } catch (e) {
      host.innerHTML = `<div class="notice bad">${esc(Store.describeError(e))}</div>`;
      return;
    }

    if (!rows.length) {
      host.innerHTML = `<p class="empty-state">${esc(I18N.t('adminHistoryEmpty'))}</p>`;
      return;
    }

    // Most recently decided first — that is what you are usually looking for.
    rows.sort((a, b) => String(b.reviewed_at || b.created_at).localeCompare(String(a.reviewed_at || a.created_at)));

    host.innerHTML = rows.map(r => {
      const person = state.byId.get(r.person_id);
      const who = person ? I18N.pick(person, 'name').text : (r.person_name || r.person_id);
      const when = r.reviewed_at ? new Date(r.reviewed_at).toLocaleDateString(I18N.isUrdu ? 'ur-PK' : 'en-GB',
        { day: 'numeric', month: 'short', year: 'numeric' }) : '';
      const approved = r.status === 'approved';
      return `<div class="sugg decided">
        <div class="sugg-head">
          <strong>${esc(who)}</strong>
          <span class="pill ${approved ? 'ok' : 'no'}">${esc(I18N.t(approved ? 'adminWasApproved' : 'adminWasRejected'))}</span>
        </div>
        <div class="sugg-change">
          <span class="field-label">${esc(I18N.label(r.field))}</span>
          <span class="field-value">${esc(I18N.display(r.new_value))}</span>
        </div>
        <div class="sugg-meta">${esc(I18N.t('adminDecidedMeta', r.author, when))}</div>
      </div>`;
    }).join('');
  }

  /* ── lock manager ───────────────────────────────────────────────── */

  const LOCKABLE = window.EDITABLE_FIELDS.map(f => f.key);

  function renderLocks() {
    const filter = ($('#lockSearch') && $('#lockSearch').value.trim().toLowerCase()) || '';
    const list = state.people.filter(p => !filter || (p.name || '').toLowerCase().includes(filter));

    $('#locksHost').innerHTML =
      `<div class="search" style="margin-block-end:1rem">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
        <input type="search" id="lockSearch" value="${esc(filter)}" placeholder="${esc(I18N.t('searchPlaceholder'))}" autocomplete="off">
      </div>` +
      list.map(p => {
        const locked = Array.isArray(p.locked) ? p.locked : [];
        const pills = LOCKABLE
          .filter(f => (p[f] || '').trim() || locked.includes(f))
          .map(f => `<button class="lock-pill${locked.includes(f) ? ' on' : ''}" type="button" data-person="${esc(p.id)}" data-field="${esc(f)}">
            ${locked.includes(f) ? ICON.lock : ICON.unlock}<span>${esc(fieldLabel(f))}</span>
          </button>`).join('');
        return `<article class="sugg">
          <div class="sugg-head"><strong>${esc(p.name)}</strong>
            <span class="who">${locked.length ? esc(I18N.digits(String(locked.length))) + ' ' + esc(I18N.t('adminLockedFields').toLowerCase()) : ''}</span>
          </div>
          <div class="lock-grid">${pills || `<span class="who">${esc(I18N.t('adminEmpty'))}</span>`}</div>
        </article>`;
      }).join('');
  }

  async function toggleLock(personId, field) {
    const p = state.byId.get(personId);
    if (!p) return;
    const locked = Array.isArray(p.locked) ? [...p.locked] : [];
    const i = locked.indexOf(field);
    if (i >= 0) locked.splice(i, 1); else locked.push(field);
    p.locked = locked;
    renderLocks();
    try {
      await Store.setLocked(personId, locked);
    } catch (e) {
      console.error(e);
      toast(Store.describeError(e), true);
      await refreshSafely();
    }
  }

  /* ── boot ───────────────────────────────────────────────────────── */

  async function refresh() {
    // strict: reviewing against a silently-substituted seed file would mean
    // approving changes onto data that is not what is actually stored.
    state.people = await Store.getPeople({ strict: true });
    state.people.forEach(p => { if (!Array.isArray(p.locked)) p.locked = p.locked ? [].concat(p.locked) : []; });
    state.byId = new Map(state.people.map(p => [p.id, p]));
    state.pending = await Store.getPending();
    renderQueue();
    if (!$('#pane-locks').hidden) renderLocks();
  }

  /* refresh() used to be called with nothing catching its failures, so an
   * expired token produced an empty page rather than an explanation. */
  async function refreshSafely() {
    try {
      await refresh();
    } catch (e) {
      console.error(e);
      const msg = esc(Store.describeError(e));
      $('#queueHost').innerHTML =
        `<div class="notice bad">${msg}</div>` +
        `<button class="btn btn-primary" type="button" id="reSignIn">${esc(I18N.t('adminSignIn'))}</button>`;
      const again = $('#reSignIn');
      if (again) again.addEventListener('click', () => { Store.signOut(); location.reload(); });
    }
  }

  function showApp() {
    $('#signin').hidden = true;
    $('#adminTabs').hidden = false;
    $('#signOutBtn').hidden = false;
    $('#backupBtn').hidden = false;
    $('#pane-queue').hidden = false;
    refreshSafely();
  }

  /* Download everything as one JSON file.
   *
   * The Supabase free plan does not provide downloadable backups, so this is
   * the only copy of the record that exists outside their servers. It takes
   * the full suggestion history too, not just the approved tree, so a
   * rejected or superseded submission can still be recovered later. */
  async function downloadBackup() {
    const btn = $('#backupBtn');
    const label = btn.textContent;
    btn.disabled = true;
    btn.textContent = I18N.t('adminBackupWorking');
    try {
      const [people, suggestions] = await Promise.all([
        Store.getPeople(),
        Store.getAllSuggestions()
      ]);
      const stamp = new Date().toISOString().slice(0, 10);
      const blob = new Blob([JSON.stringify({
        exported_at: new Date().toISOString(),
        counts: { people: people.length, suggestions: suggestions.length },
        people: people,
        suggestions: suggestions
      }, null, 2)], { type: 'application/json' });

      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `family-tree-backup-${stamp}.json`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 0);
    } catch (e) {
      console.error(e);
      alert(I18N.t('adminBackupFailed'));
    } finally {
      btn.disabled = false;
      btn.textContent = label;
    }
  }

  function applyStrings() {
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = I18N.t(el.dataset.i18n); });
  }

  function wire() {
    $('#signinBtn').addEventListener('click', async () => {
      const btn = $('#signinBtn');
      btn.disabled = true;
      const ok = await Store.signIn($('#email').value.trim(), $('#pass').value);
      btn.disabled = false;
      if (ok) { showApp(); }
      else { $('#signinError').hidden = false; $('#signinError').textContent = I18N.t('adminWrongPass'); }
    });
    $('#pass').addEventListener('keydown', e => { if (e.key === 'Enter') $('#signinBtn').click(); });

    $('#signOutBtn').addEventListener('click', () => { Store.signOut(); location.reload(); });
    $('#backupBtn').addEventListener('click', downloadBackup);

    $('#langBtn').addEventListener('click', () => {
      I18N.setLang(I18N.isUrdu ? 'en' : 'ur');
      applyStrings();
      renderQueue();
      if (!$('#pane-locks').hidden) renderLocks();
    });

    document.querySelectorAll('#adminTabs .tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const want = tab.dataset.pane;
        document.querySelectorAll('#adminTabs .tab').forEach(t => t.setAttribute('aria-selected', String(t === tab)));
        // Derive the panes from the tabs rather than naming them one by one,
        // so adding a tab can never again leave a pane that nothing shows.
        document.querySelectorAll('#adminTabs .tab').forEach(t => {
          const pane = $('#pane-' + t.dataset.pane);
          if (pane) pane.hidden = t.dataset.pane !== want;
        });
        if (want === 'locks')   renderLocks();
        if (want === 'history') renderHistory();
      });
    });

    $('#queueHost').addEventListener('click', e => {
      const btn = e.target.closest('[data-do]');
      if (!btn) return;
      act(btn.closest('.sugg').dataset.key, btn.dataset.do);
    });

    $('#locksHost').addEventListener('click', e => {
      const pill = e.target.closest('[data-field]');
      if (pill) toggleLock(pill.dataset.person, pill.dataset.field);
    });
    let lockTimer;
    $('#locksHost').addEventListener('input', e => {
      if (e.target.id !== 'lockSearch') return;
      clearTimeout(lockTimer);
      lockTimer = setTimeout(() => {
        const pos = e.target.selectionStart;
        renderLocks();
        const next = $('#lockSearch');
        next.focus();
        next.setSelectionRange(pos, pos);
      }, 180);
    });
  }

  try {
    const saved = localStorage.getItem('rft-theme');
    if (saved) document.documentElement.setAttribute('data-theme', saved);
  } catch (e) { /* private mode */ }

  I18N.setLang(I18N.lang);
  applyStrings();
  wire();

  if (Store.isAdmin) showApp();
  else if (!Store.isLive) {
    // Local mode has no accounts to sign into — go straight in so the
    // review flow can be tried out before Supabase is connected.
    Store.signIn('', '').then(showApp);
  }
})();
