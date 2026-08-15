---
name: project_overview
description: "Overview of the Rizvi Family Tree website project, what it is, and why it exists"
metadata: 
  node_type: memory
  type: project
  originSessionId: 59833c74-2e79-4c14-a128-d291e4c16aaf
  modified: 2026-08-15T02:00:24.885Z
---

# Rizvi Family Tree Project Overview

## What It Is
A **bilingual (English/Urdu), shareable family tree website** that allows relatives to browse, search, and suggest edits to a living family record. The tree is hosted on Supabase (database) and deployed on Netlify or Cloudflare Pages.

## Current State (as of 2026-08-14)
- **104 family members** recorded (expanded from original 39 from the Word document)
- **82 pending edit suggestions** from relatives awaiting review/approval
- **Full bilingual interface** — English and Urdu (RTL), both languages equally complete
- **Photo support** — relatives can submit photographs for approval before they appear live
- **Admin review queue** — owner reviews, approves, approves-with-lock, or rejects all suggestions
- **Geographic timeline** — shows the family's movement (Lucknow → Murshidabad → various cities)
- **Historical context tabs** — family history sources, research questions, and provenance notes

## Key Features
1. **No sign-in on the public tree** — it's "link as key" model; anyone with the link can read the tree and submit suggestions
2. **Photo submissions** — relatives can upload family photos; they appear after admin approval
3. **Editable fields with confidence tags** — each person shows "confirmed," "estimated," or "shajra" (from original genealogy scroll)
4. **Bilateral fields** — name, birth, death, place, residence, spouse, and biography all exist in English and Urdu
5. **Lock management** — admin can freeze individual fields once verified (e.g., lock a death date while leaving children's names open)
6. **Search and navigation** — autocomplete search for names, places, spouses; clicking opens the detail panel and highlights the path up the tree
7. **Responsive design** — works on phone, tablet, desktop; light and dark modes

## Why It Exists
To create a **living, editable family record** that:
- Brings the family together across geographies (UAE, US, Pakistan, UK, Bangladesh)
- Preserves the genealogy beyond the original Word document
- Lets relatives fill in gaps they know
- Makes the verification process transparent (showing what's been confirmed vs. estimated)
- Respects privacy (no public search engine access) while being easy to share within the family

## Technology Stack
- **Frontend**: Vanilla HTML, CSS, JavaScript (no build step, no framework)
- **Database**: Supabase PostgreSQL with row-level security (RLS)
- **Hosting**: Netlify or Cloudflare Pages (static files)
- **Deployment**: Drag-and-drop; any file change needs a new deploy
- **Backup strategy**: Git snapshots (tools/snapshot.js) run periodically and commit history to the repo

## Owner
Hussain Raza (hussainrazarizvi@gmail.com)

## Repository
GitHub (private expected, but can be public)
- Latest commits show feature work (animations, breadcrumb navigation, timeline, photo support)
- Snapshot from 2026-08-10 in git history
