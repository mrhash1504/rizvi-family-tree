---
name: architecture_decisions
description: Key architectural and design decisions made for the Rizvi Family Tree
metadata: 
  node_type: memory
  type: project
  originSessionId: 59833c74-2e79-4c14-a128-d291e4c16aaf
  modified: 2026-08-15T02:00:41.847Z
---

# Architecture & Design Decisions

## No Sign-In on Public Tree
**Decision**: Relatives browse the public tree anonymously; only suggestions require their name.

**Why**: A sign-in barrier is friction that stops casual browsing. The family already knows to keep the link private, so social trust replaces technical login.

**Trade-off**: Means anyone with the link can see birth years of children; mitigated by keeping the tree off search engines (robots.txt + noindex meta tag).

---

## Bilingual from the Start (English + Urdu)
**Decision**: Every field exists in both languages; Urdu is not auto-translated, but hand-entered.

**Why**: 
- Auto-translation garbles proper nouns (e.g., "Phool" becomes the word for flower)
- The family reads both languages; forcing one excludes relatives
- Urdu elder relatives can open the tree, switch to Urdu, and fill in a complete profile without seeing English

**Structure**: 
- Each field pair: `name` / `name_ur`, `birth` / `birth_ur`, etc.
- Interface flips right-to-left when switched to Urdu
- Form prioritizes the user's language (Urdu fields first if reading Urdu, English first if reading English)

---

## Vanilla JS, No Build Step
**Decision**: HTML, CSS, and JavaScript only—no React, Vue, or build pipeline.

**Why**:
- Makes it forkable—another family can copy the folder and run their own tree with no tooling
- Deployment is just drag-and-drop to Netlify or Cloudflare Pages
- Fast page load; no JavaScript overhead
- Future-proof—if dependencies break, plain files still work

**Trade-off**: No TypeScript, no component reuse—but a family tree is small enough that this doesn't hurt.

---

## Supabase (PostgreSQL) + Row-Level Security
**Decision**: Use Supabase for the database, with RLS policies that enforce permissions client-side.

**Why**:
- Free tier is generous; scales well for small projects
- Hosted postgres means no server to manage
- RLS lets the frontend use the public anon key safely (credentials don't go in environment variables)
- Relatives can read the tree, file suggestions, and nothing else

**Credentials**:
- The anon API key is public (in assets/config.js); this is by design
- The key is safe because RLS policies restrict what it can access

**Fallback**: If Supabase is down or paused, the tree falls back to `assets/snapshot.js`—the last copy of all 104 people, bundled with the code.

---

## Suggestions Go to a Queue, Not Directly Live
**Decision**: Relatives submit changes; admin reviews them before they appear on the tree.

**Why**:
- Prevents vandalism
- Allows the owner to verify or reject guesses
- Maintains a permanent record of who suggested what and when
- Gives relatives a sense that their input matters (they see it in flight with a gold count badge)

**Database**:
- `suggestions` table holds pending edits
- `people` table holds the live tree
- Admin approval copies the suggestion to the live record

---

## Confidence Tags (Confirmed / Estimated / Shajra)
**Decision**: Each person carries a tag showing the source of their information.

**Why**:
- Makes the family record honest—doesn't hide what's uncertain
- Readers know which dates are guesses vs. checked facts
- The source document (photographed genealogy scroll) is credited explicitly

**Values**:
- `confirmed` — checked against civil records or living memory
- `estimated` — calculated from age gaps or family recollection
- `shajra` — from the original genealogy scroll, unchecked

---

## Photos Submitted and Approved
**Decision**: Relatives upload photos via the web form; they appear only after admin approval.

**Why**:
- Prevents spam/vandalism
- Lets the admin caption and contextualize photos
- Photo storage lives on Supabase; URLs are saved in the `photo` field

**File Format**: PNG or JPEG; stored in Supabase's storage bucket.

---

## Field-Level Locking (Not Row-Level)
**Decision**: Admin can freeze individual fields (e.g., "lock the death date") without freezing the whole person record.

**Why**:
- A verified death date stays locked, but children's names can still be added
- Lets the record evolve asymmetrically

**Storage**: `locked` is an array of field names; if a field is in the array, it's locked.

---

## Git as the Permanent Backup
**Decision**: `tools/snapshot.js` runs periodically, exports all 104 people from Supabase, and commits to git.

**Why**:
- Git history is permanent and versioned
- No backup files to manually manage or lose
- The offline fallback (`assets/snapshot.js`) stays current
- Prevents Supabase free-tier pause (weekly read = activity)

**Credentials**: Uses the public anon key from config.js; no secrets needed.

---

## No Personalized Export/Download
**Decision**: Relatives see and edit the tree in the browser, but don't download their own copies.

**Why**: Keeps a single source of truth; avoids the versioning mess of dozens of forked Excel files.

**Future**: Could add an export-to-PDF feature if requested, but for now the web app is the source.
