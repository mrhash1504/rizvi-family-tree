---
name: data_model
description: Database schema and data model for the Rizvi Family Tree
metadata: 
  node_type: memory
  type: project
  originSessionId: 59833c74-2e79-4c14-a128-d291e4c16aaf
  modified: 2026-08-15T02:01:00.344Z
---

# Data Model

## People Table (`people`)

Each person record contains:

| Field | Type | Purpose |
|-------|------|---------|
| `id` | text (primary key) | Unique slug, e.g. `hussain-ali-rizvi`, `ali-raza-rizvi` |
| `parent` | text (foreign key) | ID of the person's father; NULL for the root (Mir Ali Hussain Rizvi) |
| `name` | text | English full name |
| `name_ur` | text | Urdu name |
| `birth` | text | Birth year or range, e.g. "b. 2001" or "b. c. 1949–1950" |
| `birth_ur` | text | Urdu version of birth |
| `death` | text | Death year or full date, e.g. "d. 2021" or "d. 1 January 2015" |
| `death_ur` | text | Urdu version of death |
| `birthplace` | text | City or region where born |
| `birthplace_ur` | text | Urdu version |
| `residence` | text | Where they lived or currently live; can list multiple cities |
| `residence_ur` | text | Urdu version |
| `spouse` | text | Spouse's name and notes, e.g. "Tasneem Fatima, b. 1950 (Naqvi descent)" |
| `spouse_ur` | text | Urdu version |
| `notes` | text | Biography, family stories, or context (e.g., profession, achievement) |
| `notes_ur` | text | Urdu version |
| `tag` | text | One of: `confirmed`, `estimated`, `shajra` |
| `photo` | text | URL to the person's photograph (Supabase storage) |
| `photo_caption` | text | Caption for the photo in English |
| `photo_caption_ur` | text | Caption in Urdu |
| `birth_order` | integer | Sibling position (1 = eldest, for sorting children) |
| `sort_order` | integer | Manual sort override; mostly 0 (uses birth_order) |
| `locked` | array of text | Which fields are frozen, e.g. `["death", "birthplace"]` |
| `pending_count` | integer | Number of suggestions waiting for this person |
| `updated_at` | timestamp | Last change timestamp (from Supabase's automatic tracking) |

### Sample Record
```json
{
  "id": "hussain-ali-rizvi",
  "parent": "afzal-hussain-rizvi",
  "name": "Syed Hussain Ali Rizvi",
  "name_ur": "سید حسین علی رضوی",
  "birth": "b. 1882–1883 (estimated)",
  "birth_ur": "پیدائش ۱۸۸۲–۱۸۸۳ء (تخمینی)",
  "death": "d. c. 1950",
  "death_ur": "وفات تقریباً ۱۹۵۰ء",
  "birthplace": "Lucknow",
  "residence": "Lucknow, later Murshidabad",
  "spouse": "Nowrozi Begum (3rd wife), b. 1912–1913 (estimated)",
  "spouse_ur": "نوروزی بیگم (تیسری اہلیہ)",
  "notes": "A religious scholar and zakir...",
  "notes_ur": "عالمِ دین اور ذاکر",
  "tag": "estimated",
  "photo": "assets/photos/hussain-ali-rizvi.jpg",
  "photo_caption": "",
  "photo_caption_ur": "",
  "birth_order": 3,
  "sort_order": 0,
  "locked": [],
  "pending_count": 0,
  "updated_at": "2026-08-11T18:15:11.583383+00:00"
}
```

---

## Suggestions Table (`suggestions`)

Holds pending edits from relatives:

| Field | Type | Purpose |
|-------|------|---------|
| `id` | uuid (primary key) | Unique ID for this suggestion |
| `person_id` | text (foreign key) | Which person is being edited |
| `field_name` | text | Which field: `name`, `birth`, `death`, `spouse`, `notes`, etc. |
| `suggested_value` | text | What the relative is proposing |
| `submitted_by` | text | Name of the person who submitted it |
| `submitted_at` | timestamp | When they submitted it |
| `status` | text | One of: `pending`, `approved`, `rejected` |
| `reviewed_by` | text | Who reviewed it (NULL if pending) |
| `reviewed_at` | timestamp | When it was reviewed (NULL if pending) |

### How It Works
1. A relative fills in a form on the public tree (e.g., "I know Abbas Raza's wife's birthday is 15 March 1952")
2. The form creates a row in `suggestions` with `status = 'pending'`
3. The public tree shows a gold count badge: "3 pending changes"
4. Admin opens `/admin.html`, sees the suggestion, and clicks **Approve**, **Approve & lock**, or **Reject**
5. If approved, the value is copied to `people` and `suggestions.status` becomes `approved`
6. The public tree now shows the updated value

---

## Row-Level Security (RLS) Policies

**Public access** (no auth required):
- `SELECT *` from `people` — read the entire tree
- `INSERT` into `suggestions` — submit edits
- `SELECT *` from `suggestions` where `status = 'pending'` — see pending suggestions (for the public badge count)

**Admin access** (email + password auth):
- `SELECT *` from `suggestions` — see all suggestions
- `UPDATE people` — approve changes
- `UPDATE suggestions SET status = 'approved'` — mark as reviewed
- `UPDATE people SET locked` — freeze/unfreeze fields

---

## Data Integrity

**No cascade delete**: If a person is deleted, suggestions referencing them are orphaned (not deleted).

**Backup/Fallback**: If Supabase is down, the tree loads from `assets/snapshot.js`, which is a copy of the entire `people` table committed to git.

**Current Stats** (as of 2026-08-14):
- 104 people
- 82 pending suggestions
- Latest export: `family-tree-backup-2026-08-14.json` in Downloads folder
