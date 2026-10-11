/* Public family tree: browse, search, and suggest changes. */

(() => {
  const $ = sel => document.querySelector(sel);
  const cfg = window.RFT_CONFIG || {};

  const state = {
    people: [],
    byId: new Map(),
    children: new Map(),
    roots: [],
    pending: {},
    open: new Set(),
    selected: null,
    query: '',
    mode: 'view'   // 'view' | 'edit' | 'add'
  };

  /* ── icons ──────────────────────────────────────────────────────── */
  const ICON = {
    chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>',
    chevronDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 9 7 7 7-7"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
    pencil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h2.2l1.2-2h8.2l1.2 2h2.2A1.5 1.5 0 0 1 21 8.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5z"/><circle cx="12" cy="13" r="3.4"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.01"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 3 10.5 13.5M21 3l-6.8 18-3.7-7.5L3 9.8z"/></svg>'
  };

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ── index building ─────────────────────────────────────────────── */

  function reindex() {
    state.byId = new Map(state.people.map(p => [p.id, p]));
    state.children = new Map();
    state.roots = [];
    state.people.forEach(p => {
      if (p.parent && state.byId.has(p.parent)) {
        if (!state.children.has(p.parent)) state.children.set(p.parent, []);
        state.children.get(p.parent).push(p);
      } else {
        state.roots.push(p);
      }
    });
    state.children.forEach(children => {
      children.sort((a, b) => (a.birth_order ?? Infinity) - (b.birth_order ?? Infinity));
    });
  }

  const kids = id => state.children.get(id) || [];

  function ancestorsOf(id) {
    const out = [];
    let p = state.byId.get(id);
    while (p && p.parent) { out.push(p.parent); p = state.byId.get(p.parent); }
    return out;
  }

  function depthOf(id) { return ancestorsOf(id).length + 1; }

  /* ── search ─────────────────────────────────────────────────────── */

  function matches(person, q) {
    if (!q) return true;
    const hay = [person.name, person.name_ur, person.spouse, person.spouse_ur, person.residence, person.birthplace]
      .filter(Boolean).join(' ').toLowerCase();
    return hay.includes(q);
  }

  function hitSet(q) {
    if (!q) return null;
    const hits = new Set();
    state.people.forEach(p => { if (matches(p, q)) hits.add(p.id); });
    return hits;
  }

  function highlight(text, q) {
    if (!q) return esc(text);
    const i = text.toLowerCase().indexOf(q);
    if (i < 0) return esc(text);
    return esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + q.length)) + '</mark>' + esc(text.slice(i + q.length));
  }

  /* ── tree rendering ─────────────────────────────────────────────── */

  function summaryLine(p) {
    const bits = [];
    if (p.birth) bits.push(p.birth);
    if (p.death) bits.push(p.death);
    const place = p.residence || p.birthplace;
    if (place) bits.push(place);
    const sp = I18N.pick(p, 'spouse');
    if (sp.text) bits.push((I18N.isUrdu ? 'ازدواج ' : 'm. ') + sp.text);
    return I18N.display(bits.join(' · '));
  }

  function tagChip(p) {
    if (!p.tag || p.tag === 'confirmed') return '';
    const key = p.tag === 'estimated' ? 'tagEstimated' : 'tagShajra';
    const hint = p.tag === 'estimated' ? 'tagEstimatedHint' : 'tagShajraHint';
    return `<span class="chip-tag tag-${esc(p.tag)}" title="${esc(I18N.t(hint))}">${esc(I18N.t(key))}</span>`;
  }

  function renderNodes(list, hits) {
    const q = state.query;
    return list.map(p => {
      const ch = kids(p.id);
      const isOpen = state.open.has(p.id);
      const nameVal = I18N.pick(p, 'name');
      const pend = state.pending[p.id] || 0;
      const isHit = hits && hits.has(p.id);
      const isDim = hits && !isHit;
      const isPatriarch = p.id === 'hussain-ali-rizvi';

      const badges = [
        tagChip(p),
        pend ? `<span class="dot-pending" title="${esc(I18N.t('pendingHint', pend))}">${esc(I18N.digits(String(pend)))}</span>` : '',
        (p.locked && p.locked.length) ? `<span class="lock-mini" title="${esc(I18N.t('lockedHint'))}">${ICON.lock}</span>` : ''
      ].filter(Boolean).join('');

      const summary = summaryLine(p);
      const photoHtml = p.photo ? `<img class="tree-photo" src="${esc(p.photo)}" alt="${esc(nameVal.text)}" loading="lazy">` : '';

      return `<li class="node${isHit ? ' is-hit' : ''}${isDim ? ' is-dim' : ''}${isPatriarch ? ' is-patriarch' : ''}" data-id="${esc(p.id)}">
        <div class="node-row${isOpen ? ' is-open' : ''}">
          <button class="twist${ch.length ? '' : ' leaf'}" type="button" data-twist="${esc(p.id)}"
                  aria-label="${ch.length ? esc(I18N.t('childCount', ch.length)) : ''}"
                  aria-expanded="${isOpen}" ${ch.length ? '' : 'tabindex="-1" aria-hidden="true"'}>${ICON.chevron}</button>
          ${photoHtml}
          <button class="node-main" type="button" data-open="${esc(p.id)}">
            <span class="node-name">${highlight(nameVal.text, q)}${nameVal.isFallback ? '<span class="fallback-mark">EN</span>' : ''}</span>
            ${badges ? `<span class="node-badges">${badges}</span>` : ''}
            ${summary ? `<span class="node-meta">${esc(summary)}</span>` : ''}
          </button>
        </div>
        ${ch.length && isOpen ? `<ul>${renderNodes(ch, hits)}</ul>` : ''}
      </li>`;
    }).join('');
  }

  function renderTree() {
    const host = $('#treeHost');
    const hits = hitSet(state.query);

    if (hits && hits.size === 0) {
      host.innerHTML = `<p class="empty-state">${esc(I18N.t('noResults'))}</p>`;
      $('#resultNote').hidden = true;
      return;
    }

    if (hits) {
      // Auto-open the path to every match so results are visible.
      hits.forEach(id => ancestorsOf(id).forEach(a => state.open.add(a)));
      $('#resultNote').hidden = false;
      $('#resultNote').textContent = I18N.t('resultsCount', hits.size);
    } else {
      $('#resultNote').hidden = true;
    }

    host.innerHTML = `<ul class="tree">${renderNodes(state.roots, hits)}</ul>`;
  }

  /* ── detail panel ───────────────────────────────────────────────── */

  /* Base names only — pick() resolves each to the reader's language. */
  const VIEW_FIELDS = ['birth', 'death', 'birthplace', 'residence', 'spouse'];

  function relationLine(p) {
    const parent = p.parent && state.byId.get(p.parent);
    const ch = kids(p.id);
    const bits = [];
    bits.push(esc(I18N.t('generation', I18N.digits(String(depthOf(p.id))))));
    if (parent) {
      const pn = I18N.pick(parent, 'name').text;
      bits.push(`${esc(I18N.t('relationshipTo'))} <b>${esc(pn)}</b>`);
    }
    if (ch.length) bits.push(esc(I18N.digits(I18N.t('childCount', ch.length))));
    return bits.join(' · ');
  }

  function isLocked(p, field) { return Array.isArray(p.locked) && p.locked.includes(field); }

  function renderView(p) {
    const rows = [];

    VIEW_FIELDS.forEach(f => {
      const val = I18N.pick(p, f);
      // A field counts as locked if either half of the language pair is.
      const locked = isLocked(p, f) || isLocked(p, f + '_ur');
      const shown = val.text ? esc(I18N.display(val.text)) : `<span class="blank">${esc(I18N.t('notRecorded'))}</span>`;
      rows.push(`<div class="field">
        <div class="field-label">${esc(I18N.label(f))}${locked ? `<span title="${esc(I18N.t('lockedHint'))}">${ICON.lock}</span>` : ''}</div>
        <div class="field-value${val.text ? '' : ' blank'}"${val.isFallback ? ' dir="ltr" style="text-align:start"' : ''}>${shown}${val.isFallback ? '<span class="fallback-mark">EN</span>' : ''}</div>
      </div>`);
    });

    // The bio always gets a row, even when empty — an empty one is an
    // invitation, and filling these in is most of the point of the site.
    const notes = I18N.pick(p, 'notes');
    const notesLocked = isLocked(p, 'notes') || isLocked(p, 'notes_ur');
    rows.push(`<div class="field stack bio">
      <div class="field-label">${esc(I18N.label('notes'))}${notesLocked ? `<span title="${esc(I18N.t('lockedHint'))}">${ICON.lock}</span>` : ''}</div>
      ${notes.text
        ? `<div class="field-value"${notes.isFallback ? ' dir="ltr" style="text-align:start"' : ''}>${esc(notes.isFallback ? notes.text : I18N.digits(notes.text))}${notes.isFallback ? '<span class="fallback-mark">EN</span>' : ''}</div>`
        : `<button class="bio-invite" type="button" data-act="edit-bio">
             ${ICON.pencil}<span><b>${esc(I18N.t('bioInvite'))}</b> — ${esc(I18N.t('bioInviteSelf'))}</span>
           </button>`}
    </div>`);

    const pend = state.pending[p.id] || 0;
    const notices = [];
    if (pend) notices.push(`<div class="notice gold">${ICON.info}<span>${esc(I18N.t('pendingHint', I18N.digits(String(pend))))}</span></div>`);
    if (p.tag && p.tag !== 'confirmed') {
      const hint = p.tag === 'estimated' ? 'tagEstimatedHint' : 'tagShajraHint';
      notices.push(`<div class="notice plain">${ICON.info}<span>${esc(I18N.t(hint))}</span></div>`);
    }

    // A portrait, where we have one. Shown above everything else — for most
    // visitors seeing the face is the point of opening the profile.
    let portrait = '';
    if (p.photo) {
      const cap = I18N.pick(p, 'photo_caption');
      portrait =
        `<figure class="portrait">
           <img src="${esc(p.photo)}" alt="${esc(I18N.pick(p, 'name').text)}" loading="lazy" decoding="async">
           ${cap.text ? `<figcaption${cap.isFallback ? ' dir="ltr" style="text-align:start"' : ''}>${esc(cap.text)}</figcaption>` : ''}
         </figure>`;
    } else {
      portrait =
        `<button class="photo-invite" type="button" data-act="add-photo">
           ${ICON.camera}<span>${esc(I18N.t('photoInvite'))}</span>
         </button>`;
    }

    $('#sheetBody').innerHTML =
      portrait +
      `<p class="rel-line">${relationLine(p)}</p>` +
      notices.join('') +
      `<div class="fields">${rows.join('')}</div>`;

    $('#sheetFoot').innerHTML =
      `<button class="btn btn-primary" type="button" data-act="edit">${ICON.pencil}<span>${esc(I18N.t('suggestEdit'))}</span></button>` +
      `<button class="btn btn-ghost" type="button" data-act="addchild" title="${esc(I18N.t('addChildTo', I18N.pick(p, 'name').text))}">${ICON.plus}</button>`;
  }

  /* ── edit / add form ────────────────────────────────────────────── */

  function fieldInput(key, value, locked) {
    const spec = window.EDITABLE_FIELDS.find(f => f.key === key);
    const script = spec.lang;
    const lockIcon = locked ? `<span title="${esc(I18N.t('lockedHint'))}">${ICON.lock}</span>` : '';
    const isBio = key === 'notes' || key === 'notes_ur';
    const ph = isBio ? ` placeholder="${esc(I18N.t('bioPlaceholder'))}"` : '';
    const attrs = `id="f-${esc(key)}" name="${esc(key)}" data-field="${esc(key)}" data-script="${script}" ${locked ? 'disabled' : ''}`;
    const control = spec.type === 'textarea'
      ? `<textarea ${attrs} rows="${isBio ? 6 : 4}"${ph}>${esc(value)}</textarea>`
      : `<input type="text" ${attrs} value="${esc(value)}" autocomplete="off">`;
    return `<div class="form-field${isBio ? ' form-field-bio' : ''}" data-wrap="${esc(key)}">
      <label for="f-${esc(key)}">${esc(I18N.label(key))}${lockIcon}</label>
      ${control}
    </div>`;
  }

  function renderForm(p, isNew, parent) {
    const heading = isNew
      ? I18N.t('addChildTo', I18N.pick(parent, 'name').text)
      : I18N.pick(p, 'name').text;
    $('#sheetName').innerHTML = esc(heading);

    const source = isNew ? {} : p;
    const lockedList = (!isNew && Array.isArray(p.locked)) ? p.locked : [];
    const anyLocked = lockedList.length > 0;

    /* Whichever language the reader is in comes first and complete; the other
     * is tucked into a collapsed section. Someone who reads only Urdu can
     * fill in the entire record without ever seeing an English input. */
    const suffix = I18N.isUrdu ? '_ur' : '';
    const otherSuffix = I18N.isUrdu ? '' : '_ur';
    const primary = window.FIELD_ORDER.map(base => base + suffix);
    const secondary = window.FIELD_ORDER.map(base => base + otherSuffix);
    const otherLabel = I18N.isUrdu ? I18N.t('inEnglish') : I18N.t('inUrdu');

    const filledInOther = secondary.some(k => (source[k] || '').trim());

    const body =
      `<div class="notice teal">${ICON.info}<span>${esc(I18N.t('editingIntro'))}</span></div>` +
      (I18N.isUrdu ? `<div class="notice plain">${ICON.info}<span>${esc(I18N.t('urduFirstHint'))}</span></div>` : '') +
      (anyLocked ? `<div class="notice plain">${ICON.lock}<span>${esc(I18N.t('lockedHint'))}</span></div>` : '') +
      `<form id="editForm" novalidate>` +
        // Shown in both languages: the English-mode form still has the Urdu
        // fields in its collapsed section, and someone filling those in needs
        // this just as much.
        romanToggleHTML() +
        // First, not last. Adding a photograph is the most valuable thing a
        // relative can do here and takes one tap; below seven text fields and
        // a collapsed section it sat 2900px down a 4400px form, which is to
        // say it may as well not have existed.
        photoPicker(source) +
        primary.map(k => fieldInput(k, source[k] || '', lockedList.includes(k))).join('') +
        `<details class="lang-alt"${filledInOther ? ' open' : ''}>
          <summary>${esc(otherLabel)} <span class="hint">${esc(I18N.t('otherLangHint'))}</span></summary>
          <div class="lang-alt-body">
            ${secondary.map(k => fieldInput(k, source[k] || '', lockedList.includes(k))).join('')}
          </div>
        </details>` +
        `<div class="form-sep">${esc(I18N.t('yourName'))}</div>` +
        `<div class="form-field">
          <label for="f-author">${esc(I18N.t('yourName'))}</label>
          <input type="text" id="f-author" data-script="${I18N.isUrdu ? 'ur' : 'en'}" autocomplete="name" placeholder="${esc(I18N.t('yourNamePlaceholder'))}">
        </div>` +
        `<div class="form-field">
          <label for="f-relation">${esc(I18N.t('yourRelation'))}</label>
          <input type="text" id="f-relation" data-script="${I18N.isUrdu ? 'ur' : 'en'}" autocomplete="off" placeholder="${esc(I18N.t('yourRelationPlaceholder'))}">
        </div>` +
        `<div class="notice bad" id="formError" hidden></div>` +
      `</form>`;

    $('#sheetBody').innerHTML = body;
    $('#sheetBody').scrollTop = 0;

    const draftKey = currentDraftKey(isNew ? parent : p, isNew);

    $('#sheetFoot').innerHTML =
      `<button class="btn btn-primary" type="button" data-act="submit">${ICON.send}<span>${esc(I18N.t('submit'))}</span></button>` +
      `<button class="btn btn-ghost" type="button" data-act="cancel">${esc(I18N.t('cancel'))}</button>`;

    // Mark fields the contributor has actually touched.
    $('#editForm').addEventListener('input', e => {
      const key = e.target.dataset.field;
      if (!key) return;

      if (e.target.dataset.script === 'ur' && romanOn() && window.RomanUrdu) {
        convertWordBeforeCaret(e.target);
      }

      const original = source[key] || '';
      e.target.closest('.form-field').classList.toggle('changed', e.target.value.trim() !== original.trim());
      saveDraft(draftKey);
    });

    const romanBox = $('#romanToggle');
    if (romanBox) {
      romanBox.addEventListener('change', () => {
        try { localStorage.setItem(ROMAN_PREF, romanBox.checked ? 'on' : 'off'); } catch (e) { /* private mode */ }
      });
    }

    // Remember the contributor between submissions.
    try {
      $('#f-author').value = localStorage.getItem('rft-author') || '';
      $('#f-relation').value = localStorage.getItem('rft-relation') || '';
    } catch (e) { /* private mode */ }

    wirePhotoPicker(draftKey);

    // If a previous attempt was interrupted — bad signal, closed tab, dead
    // battery — put the typing back rather than making them start over.
    restoreDraft(draftKey);
  }

  /* ── Roman Urdu typing ────────────────────────────────────────────────
   * Many relatives have never enabled an Urdu keyboard on their phone but
   * type Roman Urdu fluently. With this on, each word converts to Urdu
   * script as soon as they finish it. Conversion happens on the word
   * boundary rather than on every keystroke, so "phool" is not half-turned
   * into پ‌ہ before they have finished the word. */

  const ROMAN_PREF = 'rft-roman-urdu';

  function romanOn() {
    try { return localStorage.getItem(ROMAN_PREF) !== 'off'; } catch (e) { return true; }
  }

  function romanToggleHTML() {
    return `<label class="roman-toggle">
      <input type="checkbox" id="romanToggle"${romanOn() ? ' checked' : ''}>
      <span><b>${esc(I18N.t('romanLabel'))}</b> — ${esc(I18N.t('romanHint'))}</span>
    </label>`;
  }

  /* Convert the word that sits immediately before the caret. */
  function convertWordBeforeCaret(el) {
    const pos = el.selectionStart;
    const upto = el.value.slice(0, pos);
    // The separator the contributor just typed, and the word before it.
    const m = upto.match(/([A-Za-z][A-Za-z']*)(\s|[.,،۔!?؟:;)\]]|\n)$/);
    if (!m) return false;

    const word = m[1];
    const converted = window.RomanUrdu.word(word);
    if (converted === word) return false;

    const start = pos - m[0].length;
    el.value = el.value.slice(0, start) + converted + m[2] + el.value.slice(pos);
    const newPos = start + converted.length + m[2].length;
    el.setSelectionRange(newPos, newPos);
    return true;
  }

  /* Anything still in Latin when they submit — the final word, typically,
   * since it was never followed by a space — gets converted too. */
  function convertRemaining(el) {
    const out = window.RomanUrdu.text(el.value);
    if (out !== el.value) el.value = out;
  }

  /* ── Visit counting ───────────────────────────────────────────────────
   * Fire-and-forget to an edge function, which resolves the country from the
   * request and records it. Nothing identifying leaves the browser: the
   * session id is random, lives only for this tab, and is gone when it
   * closes, so it groups page views into one visit without following anyone
   * from one day to the next. */

  function visitSession() {
    try {
      let s = sessionStorage.getItem('rft-session');
      if (!s) {
        s = (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2)).slice(0, 36);
        sessionStorage.setItem('rft-session', s);
      }
      return s;
    } catch (e) { return ''; }   // private mode: just counts as a fresh visit
  }

  function trackVisit(path) {
    // Never let statistics get in the way of the page.
    try {
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: path, session: visitSession() }),
        keepalive: true
      }).catch(() => {});
    } catch (e) { /* ignore */ }
  }

  /* ── Photo picker ─────────────────────────────────────────────────────
   * A photo is not language-specific, so it sits outside the two language
   * blocks. The chosen file uploads straight away to a pending folder and
   * the resulting URL goes into a hidden field, which means the ordinary
   * change-detection and submit path carry it with no special cases.
   *
   * The image is attached to nobody until the owner approves it in the
   * review queue, exactly like a text change. */

  function photoPicker(source) {
    const current = (source && source.photo) || '';
    return `<div class="form-sep">${esc(I18N.t('photoSection'))}</div>
      <div class="form-field photo-field">
        ${current ? `<img class="photo-current" src="${esc(current)}" alt="">
                     <p class="hint">${esc(I18N.t('photoReplaceHint'))}</p>` : ''}
        <input type="file" id="photoFile" accept="image/jpeg,image/png,image/webp">
        <p class="hint">${esc(I18N.t('photoHint'))}</p>
        <div id="photoStatus" class="photo-status" hidden></div>
        <img id="photoPreview" class="photo-preview" alt="" hidden>
        <input type="hidden" id="f-photo" data-field="photo" data-script="en" value="${esc(current)}">
      </div>`;
  }

  function wirePhotoPicker(draftKey) {
    const input = $('#photoFile');
    if (!input) return;

    input.addEventListener('change', async () => {
      const file = input.files && input.files[0];
      const status = $('#photoStatus');
      const preview = $('#photoPreview');
      const hidden = $('#f-photo');
      if (!file) return;

      const say = (msg, bad) => {
        status.hidden = false;
        status.textContent = msg;
        status.classList.toggle('bad', !!bad);
      };

      if (!Store.PHOTO_TYPES.includes(file.type)) { say(I18N.t('photoBadType'), true); input.value = ''; return; }
      if (file.size > Store.MAX_PHOTO_BYTES)      { say(I18N.t('photoTooBig'), true);  input.value = ''; return; }

      say(I18N.t('photoUploading'));
      input.disabled = true;
      try {
        const url = await Store.uploadPendingPhoto(file);
        hidden.value = url;
        preview.src = url;
        preview.hidden = false;
        say(I18N.t('photoReady'));
        hidden.closest('.form-field').classList.add('changed');
        saveDraft(draftKey);
      } catch (e) {
        console.error(e);
        say(e.message === 'type' ? I18N.t('photoBadType')
          : e.message === 'size' ? I18N.t('photoTooBig')
          : Store.describeError(e), true);
        input.value = '';
      } finally {
        input.disabled = false;
      }
    });
  }

  /* ── Drafts ───────────────────────────────────────────────────────────
   * Held in the visitor's own browser only, and cleared the moment the
   * submission is safely in the database. */

  const DRAFT_PREFIX = 'rft-draft-';

  function currentDraftKey(p, isNew) {
    return DRAFT_PREFIX + (isNew ? 'new-under-' : '') + (p ? p.id : 'unknown');
  }

  function draftSource() {
    return state.mode === 'add' ? {} : (state.selected || {});
  }

  /* Store only what the contributor actually changed. Keeping the untouched
   * fields too would bloat storage and, worse, make a stale draft overwrite
   * a value the admin has since corrected. */
  function saveDraft(key) {
    if (!key) return;
    const form = $('#editForm');
    if (!form) return;
    const source = draftSource();
    const data = {};
    form.querySelectorAll('[data-field]').forEach(el => {
      if (el.disabled) return;
      const original = (source[el.dataset.field] || '').trim();
      if (el.value.trim() !== original) data[el.dataset.field] = el.value;
    });
    try {
      if (Object.keys(data).length) localStorage.setItem(key, JSON.stringify(data));
      else localStorage.removeItem(key);
    } catch (e) { /* private mode or quota */ }
  }

  function restoreDraft(key) {
    if (!key) return;
    let data;
    try { data = JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) { return; }
    if (!data) return;
    const form = $('#editForm');
    const source = draftSource();
    let restored = 0;
    Object.entries(data).forEach(([field, value]) => {
      const el = form.querySelector(`[data-field="${CSS.escape(field)}"]`);
      if (!el || el.disabled) return;
      // Everything stored is by definition an edit, so it takes precedence
      // over the value the form was pre-filled with.
      if (value.trim() === (source[field] || '').trim()) return;
      el.value = value;
      restored++;
    });
    if (restored) {
      const note = document.createElement('div');
      note.className = 'notice plain';
      note.innerHTML = `${ICON.info}<span>${esc(I18N.t('draftRestored'))}</span>`;
      form.prepend(note);
      form.querySelectorAll('[data-field]').forEach(el => {
        const original = (source[el.dataset.field] || '').trim();
        el.closest('.form-field').classList.toggle('changed', el.value.trim() !== original);
      });
    }
  }

  function clearDraft(key) {
    try { localStorage.removeItem(key); } catch (e) { /* private mode */ }
  }

  async function submitForm() {
    const p = state.selected;
    const isNew = state.mode === 'add';
    const parent = isNew ? p : null;
    const source = isNew ? {} : p;

    const author = $('#f-author').value.trim();
    const relation = $('#f-relation').value.trim();
    const errBox = $('#formError');
    const fail = msg => { errBox.hidden = false; errBox.textContent = msg; errBox.scrollIntoView({ block: 'nearest' }); };
    errBox.hidden = true;

    // Catch any trailing Roman word that never got a space after it.
    if (romanOn() && window.RomanUrdu) {
      $('#editForm').querySelectorAll('[data-script="ur"]').forEach(convertRemaining);
    }

    const changes = [];
    $('#editForm').querySelectorAll('[data-field]').forEach(el => {
      if (el.disabled) return;
      const key = el.dataset.field;
      const next = el.value.trim();
      const prev = (source[key] || '').trim();
      if (next !== prev) changes.push({ field: key, old_value: prev, new_value: next });
    });

    if (!changes.length) return fail(I18N.t('errNoChanges'));
    // A new person needs a name in at least one language, not specifically English.
    if (isNew && !changes.some(c => (c.field === 'name' || c.field === 'name_ur') && c.new_value)) {
      return fail(I18N.t('errNoChanges'));
    }
    if (!author) return fail(I18N.t('errNoName'));

    try { localStorage.setItem('rft-author', author); localStorage.setItem('rft-relation', relation); } catch (e) { /* private mode */ }

    const btn = $('#sheetFoot [data-act="submit"]');
    btn.disabled = true;
    btn.querySelector('span').textContent = I18N.t('submitting');

    try {
      const targetId = isNew ? Store.newId() : p.id;
      const targetName = isNew
        ? ((changes.find(c => c.field === 'name') || changes.find(c => c.field === 'name_ur') || {}).new_value)
        : (p.name || p.name_ur);
      await Store.submitSuggestions(targetId, targetName, changes, author, relation, isNew, isNew ? parent.id : null);
      // Only now is it safe to forget what they typed.
      clearDraft(currentDraftKey(isNew ? parent : p, isNew));
      closeSheet();
      toast(I18N.t('thanks'));
      state.pending = await Store.getPendingCounts();
      renderTree();
    } catch (e) {
      console.error(e);
      btn.disabled = false;
      btn.querySelector('span').textContent = I18N.t('submit');
      // The draft is deliberately still saved at this point, so whatever they
      // typed survives even if they close the tab and come back tomorrow.
      fail(Store.describeError(e));
    }
  }

  /* ── breadcrumbs ───────────────────────────────────────────────── */

  function renderBreadcrumbs(id) {
    const ancestors = ancestorsOf(id).reverse();
    if (ancestors.length === 0) return '';

    const crumbs = ancestors.map(ancestorId => {
      const ancestor = state.byId.get(ancestorId);
      if (!ancestor) return '';
      const name = I18N.pick(ancestor, 'name');
      return `<button class="breadcrumb-item" type="button" data-id="${esc(ancestorId)}">${esc(name.text)}</button>`;
    }).filter(Boolean);

    if (crumbs.length === 0) return '';
    return `<nav class="breadcrumbs">${crumbs.join('<span class="breadcrumb-sep" aria-hidden="true">›</span>')}</nav>`;
  }

  /* ── sheet control ──────────────────────────────────────────────── */

  function openSheet(id, mode) {
    const p = state.byId.get(id);
    if (!p) return;
    state.selected = p;
    state.mode = mode || 'view';

    const sheet = $('#sheet');
    sheet.hidden = false;
    $('#sideDefault').hidden = true;

    if (state.mode === 'view') {
      const nameVal = I18N.pick(p, 'name');
      $('#sheetName').innerHTML = renderBreadcrumbs(p.id) + esc(nameVal.text) + (nameVal.isFallback ? '<span class="fallback-mark">EN</span>' : '');
      renderView(p);
      // Which ancestors the family actually reads about is the statistic
      // worth having here — more so than a raw visit count.
      trackVisit(p.id);
      // Wire up breadcrumb clicks
      $('#sheetName').querySelectorAll('.breadcrumb-item').forEach(btn => {
        btn.addEventListener('click', () => openSheet(btn.dataset.id, 'view'));
      });
    } else {
      renderForm(p, state.mode === 'add', p);
    }

    requestAnimationFrame(() => {
      sheet.classList.add('show');
      $('#scrim').classList.add('show');
    });
  }

  function closeSheet(keepSideHidden) {
    const sheet = $('#sheet');
    sheet.classList.remove('show');
    $('#scrim').classList.remove('show');
    state.selected = null;
    state.mode = 'view';
    if (!keepSideHidden) $('#sideDefault').hidden = false;
    setTimeout(() => { if (!sheet.classList.contains('show')) sheet.hidden = true; }, 280);
  }

  let toastTimer;
  function toast(msg, bad) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.toggle('bad', !!bad);
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 4200);
  }

  /* ── desktop side panel ─────────────────────────────────────────── */

  const GAP_FIELDS = ['birth', 'death', 'birthplace', 'residence', 'spouse'];

  function renderGeographicTimeline() {
    const timeline = [
      { year: 'c. 1792–1793', location: 'Lucknow', era: 'Lucknow era' },
      { year: '~1927–1928', location: 'Murshidabad', era: 'Sister marries Nawab' },
      { year: '~1950–1971', location: 'East Pakistan', era: 'Post-Partition settlement' },
      { year: '~1950–present', location: 'Pakistan (25+ people)', era: 'Primary diaspora – Karachi, Islamabad, Lahore, Peshawar, Quetta, Rawalpindi' },
      { year: '~1970s–present', location: 'UAE/Dubai (10 people)', era: 'Gulf migration' },
      { year: '~1980s–present', location: 'Global (Canada, USA, Australia, New Zealand)', era: 'International expansion' }
    ];

    return `<div class="geo-timeline">
      ${timeline.map((point, i) => `
        <div class="geo-point">
          <div class="geo-dot"></div>
          <div class="geo-info">
            <div class="geo-year">${esc(point.year)}</div>
            <div class="geo-location">${esc(point.location)}</div>
            <div class="geo-era">${esc(point.era)}</div>
          </div>
        </div>
      `).join('')}
    </div>`;
  }

  function renderSideDefault() {
    const people = state.people;
    const generations = people.length ? Math.max(...people.map(p => depthOf(p.id))) : 0;
    let gaps = 0, locked = 0;
    people.forEach(p => {
      GAP_FIELDS.forEach(f => { if (!(p[f] || '').trim()) gaps++; });
      locked += Array.isArray(p.locked) ? p.locked.length : 0;
    });

    const n = v => esc(I18N.digits(String(v)));
    const questions = (window.OPEN_QUESTIONS[I18N.lang] || window.OPEN_QUESTIONS.en).slice(-4);

    const legendRows = [
      ['tag-confirmed', 'tagConfirmed', 'tagConfirmedHint'],
      ['tag-estimated', 'tagEstimated', 'tagEstimatedHint'],
      ['tag-shajra', 'tagShajra', 'tagShajraHint']
    ].map(([cls, label, hint]) =>
      `<div class="legend-row"><span class="chip-tag ${cls}">${esc(I18N.t(label))}</span><span>${esc(I18N.t(hint))}</span></div>`
    ).join('') +
      `<div class="legend-row"><span class="chip-tag tag-shajra">${ICON.lock}</span><span>${esc(I18N.t('lockedHint'))}</span></div>`;

    $('#sideDefault').innerHTML =
      `<div class="stat-grid">
        <div class="stat"><b>${n(people.length)}</b><span>${esc(I18N.t('statPeople'))}</span></div>
        <div class="stat"><b>${n(generations)}</b><span>${esc(I18N.t('statGenerations'))}</span></div>
        <div class="stat"><b>${n(gaps)}</b><span>${esc(I18N.t('statGaps'))}</span></div>
        <div class="stat"><b>${n(locked)}</b><span>${esc(I18N.t('statLocked'))}</span></div>
      </div>
      <div class="notice teal">${ICON.info}<span>${esc(I18N.t('tapPrompt'))}</span></div>
      <div class="side-block">
        <h3>Family Journey</h3>
        ${renderGeographicTimeline()}
      </div>
      <div class="side-block">
        <h3>${esc(I18N.t('mostWanted'))}</h3>
        <ol>${questions.map(q => `<li>${esc(q)}</li>`).join('')}</ol>
      </div>
      <div class="side-block">
        <h3>${esc(I18N.t('legend'))}</h3>
        <div class="legend">${legendRows}</div>
      </div>`;
  }

  /* ── history + questions ────────────────────────────────────────── */

  function renderHistory() {
    const lang = I18N.lang;
    $('#historyHost').innerHTML = window.HISTORY_SECTIONS.map((s, i) => {
      const paras = (s.body[lang] || s.body.en).map(t => `<p>${esc(t)}</p>`).join('');
      let list = '';
      if (s.list) {
        const items = (s.list.items[lang] || s.list.items.en).map(t => `<li>${esc(t)}</li>`).join('');
        list = `<h4>${esc(s.list.heading[lang] || s.list.heading.en)}</h4><ul>${items}</ul>`;
      }
      const open = i === 0;
      return `<article class="card">
        <button class="card-head" type="button" aria-expanded="${open}" aria-controls="hc-${i}">
          <span class="glyph" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="${s.icon}"/></svg></span>
          <h3>${esc(s.title[lang] || s.title.en)}</h3>
          <span class="chev" aria-hidden="true">${ICON.chevronDown}</span>
        </button>
        <div class="card-body" id="hc-${i}" ${open ? '' : 'hidden'}>${paras}${list}</div>
      </article>`;
    }).join('');
  }

  function renderQuestions() {
    const items = window.OPEN_QUESTIONS[I18N.lang] || window.OPEN_QUESTIONS.en;
    $('#questionsHost').innerHTML = items.map(q => `<div class="q-item">${esc(q)}</div>`).join('');
  }

  /* ── static text ────────────────────────────────────────────────── */

  function applyStrings() {
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = I18N.t(el.dataset.i18n); });

    // Branding overrides the default strings, so another family can rename
    // the site without touching i18n.js.
    const b = cfg.BRANDING || {};
    if (b.mark) $('.brand-mark').textContent = b.mark;
    if (b.title && b.title[I18N.lang]) {
      $('.brand-text h1').textContent = b.title[I18N.lang];
      document.title = b.title[I18N.lang];
    }
    if (b.tagline && b.tagline[I18N.lang]) $('.brand-text p').textContent = b.tagline[I18N.lang];

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => { el.placeholder = I18N.t(el.dataset.i18nPlaceholder); });
    document.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', I18N.t(el.dataset.i18nAria)); });
    if (!(cfg.BRANDING && cfg.BRANDING.title)) document.title = I18N.t('siteTitle');
  }

  function rerenderAll() {
    applyStrings();
    renderTree();
    renderSideDefault();
    renderHistory();
    renderQuestions();
    if (state.selected) openSheet(state.selected.id, state.mode);
  }

  /* ── events ─────────────────────────────────────────────────────── */

  function wire() {
    $('#langBtn').addEventListener('click', () => {
      I18N.setLang(I18N.isUrdu ? 'en' : 'ur');
      rerenderAll();
    });

    $('#themeBtn').addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme');
      const sysDark = matchMedia('(prefers-color-scheme: dark)').matches;
      const next = cur ? (cur === 'dark' ? 'light' : 'dark') : (sysDark ? 'light' : 'dark');
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('rft-theme', next); } catch (e) { /* private mode */ }
    });

    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.setAttribute('aria-selected', String(t === tab)));
        document.querySelectorAll('.pane').forEach(p => { p.hidden = true; });
        $('#pane-' + tab.dataset.pane).hidden = false;
        // The docked detail column only belongs beside the tree.
        const onTree = tab.dataset.pane === 'tree';
        $('#panes').classList.toggle('split', onTree);
        $('#sideDefault').hidden = !onTree;
        if (!onTree) closeSheet(true);
      });
    });

    const search = $('#search');
    let searchTimer;
    search.addEventListener('input', () => {
      $('#searchClear').hidden = !search.value;
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        state.query = search.value.trim().toLowerCase();
        renderTree();
      }, 140);
    });
    $('#searchClear').addEventListener('click', () => {
      search.value = '';
      $('#searchClear').hidden = true;
      state.query = '';
      renderTree();
      search.focus();
    });

    $('#expandBtn').addEventListener('click', () => {
      state.people.forEach(p => { if (kids(p.id).length) state.open.add(p.id); });
      renderTree();
    });
    $('#collapseBtn').addEventListener('click', () => {
      state.open.clear();
      state.roots.forEach(r => state.open.add(r.id));
      renderTree();
    });

    $('#treeHost').addEventListener('click', e => {
      const twist = e.target.closest('[data-twist]');
      if (twist) {
        const id = twist.dataset.twist;
        if (state.open.has(id)) state.open.delete(id); else state.open.add(id);
        renderTree();
        return;
      }
      const open = e.target.closest('[data-open]');
      if (open) {
        const id = open.dataset.open;
        // Tapping a name also reveals its children — one gesture, both jobs.
        if (kids(id).length && !state.open.has(id)) { state.open.add(id); renderTree(); }
        openSheet(id, 'view');
      }
    });

    $('#sheetFoot').addEventListener('click', e => {
      const act = e.target.closest('[data-act]');
      if (!act) return;
      if (act.dataset.act === 'edit') openSheet(state.selected.id, 'edit');
      if (act.dataset.act === 'addchild') openSheet(state.selected.id, 'add');
      if (act.dataset.act === 'cancel') openSheet(state.selected.id, 'view');
      if (act.dataset.act === 'submit') submitForm();
    });

    // "Add their story" on an empty bio drops straight into the form with
    // the bio focused, rather than making people hunt for it.
    $('#sheetBody').addEventListener('click', e => {
      if (!e.target.closest('[data-act="edit-bio"]')) return;
      openSheet(state.selected.id, 'edit');
      const bio = $('#f-notes' + (I18N.isUrdu ? '_ur' : ''));
      if (bio && !bio.disabled) { bio.scrollIntoView({ block: 'center' }); bio.focus(); }
    });

    // Same idea for a missing photograph: the gap on the profile is where
    // someone notices it, so that is where the invitation belongs.
    $('#sheetBody').addEventListener('click', e => {
      if (!e.target.closest('[data-act="add-photo"]')) return;
      openSheet(state.selected.id, 'edit');
      const picker = $('#photoFile');
      if (picker) { picker.scrollIntoView({ block: 'center' }); picker.click(); }
    });

    $('#sheetClose').addEventListener('click', closeSheet);
    $('#scrim').addEventListener('click', closeSheet);

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && state.selected) closeSheet();
    });

    $('#historyHost').addEventListener('click', e => {
      const head = e.target.closest('.card-head');
      if (!head) return;
      const open = head.getAttribute('aria-expanded') === 'true';
      head.setAttribute('aria-expanded', String(!open));
      document.getElementById(head.getAttribute('aria-controls')).hidden = open;
    });
  }

  /* ── boot ───────────────────────────────────────────────────────── */

  async function init() {
    try {
      const saved = localStorage.getItem('rft-theme');
      if (saved) document.documentElement.setAttribute('data-theme', saved);
    } catch (e) { /* private mode */ }

    I18N.setLang(I18N.lang);
    applyStrings();
    wire();

    if (!Store.isLive) $('#localBanner').hidden = false;

    state.people = await Store.getPeople();
    state.people.forEach(p => { if (!Array.isArray(p.locked)) p.locked = p.locked ? [].concat(p.locked) : []; });
    reindex();
    state.pending = await Store.getPendingCounts();

    // Open the spine down to the living generations so the first view is useful,
    // not a single collapsed ancestor.
    ['ali-hussain-rizvi', 'ghulam-raza-rizvi-sr', 'afzal-hussain-rizvi', 'hussain-ali-rizvi', 'ghulam-raza-rizvi']
      .forEach(id => { if (state.byId.has(id)) state.open.add(id); });
    if (!state.open.size) state.roots.forEach(r => state.open.add(r.id));

    renderTree();
    renderSideDefault();
    renderHistory();
    renderQuestions();

    trackVisit('tree');
  }

  init();
})();
