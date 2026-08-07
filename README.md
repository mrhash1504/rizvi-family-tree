# Rizvi Family Tree

A shareable, editable family tree built from `Rizvi_Family_Tree.docx`.
Relatives open a link, browse the tree, and suggest missing details; nothing
reaches the live tree until the owner approves it, and approved details can
be locked against further edits.

**Start here: [SETUP.md](SETUP.md)** — connecting the database and getting it
online.

## What's here

| Path | |
|---|---|
| `index.html` | The public tree — browse, search, suggest |
| `admin.html` | Owner-only review queue and lock manager |
| `assets/data.js` | The document transcribed: 39 people, history sections, open questions |
| `assets/i18n.js` | Interface strings in English and Urdu |
| `assets/store.js` | Data layer — Supabase, falling back to browser storage |
| `assets/app.js` | Tree, detail panel, edit form |
| `assets/admin.js` | Review and locking |
| `assets/styles.css` | One stylesheet, mobile-first, RTL-aware, light and dark |
| `assets/config.js` | **The only file you edit to go live** |
| `supabase/schema.sql` | Tables, row-level security, pending-count view |
| `supabase/seed.sql` | Generated from `data.js` |
| `tools/gen-seed-sql.js` | Regenerates `seed.sql` |
| `serve.js` | Local preview server |

No build step, no dependencies, no framework. It is static files; any host
will serve it.

## How it behaves

**Three tabs.** The tree itself; the history and sources from the document
(family tradition, the 2024 shajra, the Lucknow-to-Murshidabad move, burial
places, and how the estimated birth years were derived); and the 15 open
research questions.

**Expandable tree.** Opens on the direct line down to the living generations
so the first screen is useful. Tapping a name opens it and shows their
details. Search matches names, spouses and places, and auto-opens the path to
every hit.

**Confidence is visible.** The document distinguishes confirmed facts,
estimates worked out from recalled age gaps, and entries read only from the
photographed shajra. Each person carries that tag, and the reasoning is
explained rather than hidden.

**Edits go to a queue.** A relative fills in what they know and their name.
It lands in the review queue as a pending suggestion, and the person shows a
small gold count on the public tree so the family can see something is in
flight. The owner approves, approves-and-locks, or rejects.

**Locks are per field.** A verified death date can be frozen while the same
person's children stay open for additions.

**Urdu.** Full RTL interface with Nastaliq type. Person names come from
hand-written Urdu fields, never machine translation; where one is missing the
English shows with an `EN` marker so the gap is obvious and fillable.

**Layout.** One column on phones with the detail panel as a bottom sheet; two
columns from 1060px with the detail docked beside the tree, and an
at-a-glance panel filling that column when nobody is selected. Light and dark
both supported, following the system unless toggled.

## Starting your own tree

Nothing in the code is specific to one family. To run a tree for a different
family, copy this folder and change two things:

1. **`assets/config.js`** — the `BRANDING` block: the letter in the corner
   mark, the site name, and the tagline.
2. **`assets/data.js`** — replace `SEED_PEOPLE` with your own people,
   `HISTORY_SECTIONS` with your own background, and `OPEN_QUESTIONS` with
   your own gaps. Each person needs an `id`, a `parent` (or `null` for the
   root), and whichever fields you know; the rest can be empty strings.
   Bump `SEED_VERSION` when you change the shape of a record.

Then `node tools/gen-seed-sql.js`, run both SQL files in a **new** Supabase
project of your own, and deploy. Each family needs its own Supabase project
and its own deploy — the tables hold one tree.

What is **not** built: a site where anyone can sign up and get their own
tree. That means user accounts, per-family data isolation, per-family
admins, and someone paying for the shared database — a different and much
larger piece of work than this. If that is ever the goal, it is a fresh
decision rather than an extension of this.

The Urdu layer is not tied to Urdu, either: `assets/i18n.js` holds one
strings block per language and `data.js` holds one field pair per language.
Another right-to-left or left-to-right language means adding a block, not
rewriting the site.

## Provenance

Everything in `data.js` comes from the source document, which was itself
compiled from family conversation and has not been checked against birth,
marriage, or civil records. Dates and spellings are provisional. The site
says so in the footer, on the record card, and on every estimated entry —
that caveat should survive any future edit.
