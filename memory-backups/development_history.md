---
name: development_history
description: Key milestones and features added to the Rizvi Family Tree over time
metadata: 
  node_type: memory
  type: project
  originSessionId: 59833c74-2e79-4c14-a128-d291e4c16aaf
  modified: 2026-08-15T02:01:26.393Z
---

# Development History

## Original Vision
Started as a **transcription of a Word document** (`Rizvi_Family_Tree.docx`) into an **editable, shareable web form** so the family across multiple countries (UAE, US, Pakistan, UK, Bangladesh) could contribute and verify details together.

---

## Major Milestones

### Phase 0: Foundation (Early 2026)
**Commit**: `39afda4 Rizvi family tree: bilingual site with a review queue`

- Initial site launch
- 39 people from the Word document transcribed to `assets/data.js`
- Bilingual English/Urdu interface fully built
- Review queue system for suggestions
- Supabase database with RLS policies
- Static HTML/CSS/JavaScript (no build)
- Deployed on Netlify

---

### Phase 1: Locking & Admin Tools
- **Approve & lock** button so the admin can freeze verified fields
- **Manage locks** tab in admin.html for direct lock/unlock control
- Confidence tags (confirmed/estimated/shajra) visible to readers

---

### Phase 2: Photographs
**Commits**:
- `19665fa Let relatives submit photographs, subject to review`
- `41ddc04 Move the photo picker where it can actually be found`

Features:
- Relatives can upload photos from the detail panel
- Photos go to the review queue like text suggestions
- Admin approves photos before they appear
- Photo URLs stored in `people.photo` field
- Supports captions in English and Urdu

---

### Phase 3: Polish & UX
**Commits**:
- `e0a00b4 Add counting and kinship words the rules got wrong` — fixed Urdu family term translations
- `64b64d2 Show Roman-Urdu typing in both languages; Urdu punctuation and numerals`
- `47cad41 Stop a stale admin token from breaking the public tree` — session management fixes
- `7d5ab7a Renew the admin session instead of dying after an hour` — auto-renew auth

Features:
- Roman-Urdu input support (e.g., type "hussain" and see the Urdu equivalent)
- Proper Urdu numerals and punctuation
- Stable admin sessions

---

### Phase 4: Analytics & Visibility
**Commit**: `905adee Add a visitor statistics tab`

- Added a **Statistics** tab showing visitor activity
- Gives the family a sense of who's engaging with the tree

---

### Phase 5: Photos & Patriarch
**Commit**: `09297e6 Add photo thumbnails and patriarch highlighting to family tree`

Features:
- Photo thumbnails appear next to names in the tree (not just in detail panels)
- Patriarch (Mir Ali Hussain Rizvi, the root) is visually highlighted

---

### Phase 6: Animations & Timeline
**Commits**:
- `102d482 Add smooth animations, breadcrumb navigation, and geographic timeline`

Features:
- **Breadcrumb navigation**: shows the path from the selected person up to the root
- **Geographic timeline**: visualizes the family's movement through places (Lucknow → Murshidabad → Dubai, Karachi, etc.)
- **Smooth CSS animations** when opening/closing tree nodes and panels

---

## Git Snapshot History

| Date | Commit | People Count | Notes |
|------|--------|--------------|-------|
| 2026-08-10 | `16b7743` (snapshot) | ~100 | Last snapshot in git history |
| 2026-08-11 | Multiple edits | ~100 | Relative photo submissions and minor corrections |
| 2026-08-12 | Multiple edits | 104 | Growth from family suggestions |
| 2026-08-14 | Today | 104 | 82 suggestions pending review |

---

## Growth Over Time

**Original transcription**: 39 people  
**Current record**: 104 people (+ 65 from family contributions)  
**Pending improvements**: 82 suggestions awaiting admin review

The tree has more than doubled in size through organic family engagement.

---

## Key Decisions Made During Development

1. **Keep it static** — no build step, no framework, stays deployable forever
2. **Bilingual from day one** — not an afterthought, baked into the schema
3. **Relatives contribute, owner approves** — prevents vandalism while enabling crowd-sourcing
4. **Offline fallback** — backup to git, bundle a snapshot with the code
5. **Photos go to a queue too** — same approval process as text
6. **Confidence tags are visible** — honesty about what's verified vs. estimated
7. **No export/download** — single source of truth in the web app

---

## Ongoing Maintenance

- **Weekly snapshots** (or manual runs of `tools/snapshot.js`) commit current state to git
- Admin monitors the review queue and approves/rejects suggestions
- Relatives add new members as they're born or information surfaces
- No major refactors planned; site is stable and forkable for other families
