-- ═══════════════════════════════════════════════════════════════════════
-- Rizvi Family Tree — database schema
--
-- Run this in the Supabase SQL Editor, then run supabase/seed.sql to load
-- the family data.
--
-- SAFE TO RE-RUN, AND RE-RUNNING UPGRADES. `create table if not exists` on
-- its own would silently skip a table that already exists, so any column
-- added later would never appear. The `add column if not exists` block below
-- closes that gap: whatever version you ran before, running this file again
-- brings the database up to the current shape without touching your data.
--
-- The security model in one line: anyone with the link can read the tree and
-- file a suggestion; only you, signed in, can change the tree itself.
-- ═══════════════════════════════════════════════════════════════════════


-- ── The tree ───────────────────────────────────────────────────────────

create table if not exists public.people (
  id          text primary key,
  parent      text references public.people(id) on delete set null,

  -- Every field has an Urdu twin, so the whole record can be maintained in
  -- either language. A blank _ur falls back to the English in the UI.
  name           text not null default '',
  name_ur        text not null default '',
  birth          text not null default '',
  birth_ur       text not null default '',
  death          text not null default '',
  death_ur       text not null default '',
  birthplace     text not null default '',
  birthplace_ur  text not null default '',
  residence      text not null default '',
  residence_ur   text not null default '',
  spouse         text not null default '',
  spouse_ur      text not null default '',
  notes          text not null default '',
  notes_ur       text not null default '',

  -- confirmed | estimated | shajra
  tag         text not null default 'confirmed',

  -- Field names frozen against further edits, e.g. '{birth,death}'.
  locked      text[] not null default '{}',

  -- Derived: suggestions awaiting review, maintained by a trigger further
  -- down. Cached here so the public badge needs no access to suggestions.
  pending_count integer not null default 0,

  sort_order  integer not null default 0,
  updated_at  timestamptz not null default now()
);

-- Upgrade path for a `people` table created before these columns existed.
-- No-ops on a fresh database; adds only what is missing on an older one.
alter table public.people add column if not exists name           text not null default '';
alter table public.people add column if not exists name_ur        text not null default '';
alter table public.people add column if not exists birth          text not null default '';
alter table public.people add column if not exists birth_ur       text not null default '';
alter table public.people add column if not exists death          text not null default '';
alter table public.people add column if not exists death_ur       text not null default '';
alter table public.people add column if not exists birthplace     text not null default '';
alter table public.people add column if not exists birthplace_ur  text not null default '';
alter table public.people add column if not exists residence      text not null default '';
alter table public.people add column if not exists residence_ur   text not null default '';
alter table public.people add column if not exists spouse         text not null default '';
alter table public.people add column if not exists spouse_ur      text not null default '';
alter table public.people add column if not exists notes          text not null default '';
alter table public.people add column if not exists notes_ur       text not null default '';
alter table public.people add column if not exists tag            text not null default 'confirmed';
alter table public.people add column if not exists locked         text[] not null default '{}';
alter table public.people add column if not exists sort_order     integer not null default 0;
alter table public.people add column if not exists updated_at     timestamptz not null default now();
alter table public.people add column if not exists pending_count  integer not null default 0;

create index if not exists people_parent_idx on public.people (parent);
create index if not exists people_sort_idx   on public.people (sort_order);


-- ── The review queue ───────────────────────────────────────────────────
-- One row per field, so a relative who fills in four fields creates four
-- rows. The admin panel groups them back together for review.

create table if not exists public.suggestions (
  id             bigint generated always as identity primary key,

  person_id      text not null,
  person_name    text not null default '',
  parent_id      text,
  is_new_person  boolean not null default false,

  field          text not null,
  old_value      text not null default '',
  new_value      text not null default '',

  author         text not null,
  relation       text not null default '',

  status         text not null default 'pending'
                 check (status in ('pending', 'approved', 'rejected')),

  created_at     timestamptz not null default now(),
  reviewed_at    timestamptz,

  -- Keep a stray script or a paste accident from filling the table.
  constraint author_len   check (char_length(author)    between 1 and 120),
  constraint relation_len check (char_length(relation)  <= 200),
  constraint value_len    check (char_length(new_value) <= 8000)
);

-- The list of allowed field names lives outside the create, so that adding a
-- field later actually takes effect on an existing table. Without this, an
-- older constraint would keep rejecting suggestions for the new Urdu fields
-- and relatives would see "could not send" with no explanation.
alter table public.suggestions drop constraint if exists field_known;
alter table public.suggestions add  constraint field_known check (field in (
  'name',       'name_ur',
  'birth',      'birth_ur',
  'death',      'death_ur',
  'birthplace', 'birthplace_ur',
  'residence',  'residence_ur',
  'spouse',     'spouse_ur',
  'notes',      'notes_ur'
));

create index if not exists suggestions_pending_idx
  on public.suggestions (status, created_at)
  where status = 'pending';


-- ── Keep updated_at honest ─────────────────────────────────────────────

-- search_path is pinned on every function here. Without it, whoever calls the
-- function decides how unqualified names resolve, which is a known
-- privilege-escalation route.
create or replace function public.touch_updated_at()
returns trigger language plpgsql
set search_path = ''
as $$
begin
  -- pending_count is derived, not content. A new suggestion arriving should
  -- not make it look like somebody edited the person.
  if (to_jsonb(new) - 'updated_at' - 'pending_count')
       is distinct from (to_jsonb(old) - 'updated_at' - 'pending_count') then
    new.updated_at = now();
  else
    new.updated_at = old.updated_at;
  end if;
  return new;
end $$;

drop trigger if exists people_touch on public.people;
create trigger people_touch
  before update on public.people
  for each row execute function public.touch_updated_at();


-- ── Row-level security ─────────────────────────────────────────────────

alter table public.people      enable row level security;
alter table public.suggestions enable row level security;

-- The tree is public to read.
drop policy if exists "read the tree" on public.people;
create policy "read the tree"
  on public.people for select
  to anon, authenticated
  using (true);

-- Only a signed-in owner can change it.
drop policy if exists "owner writes the tree" on public.people;
create policy "owner writes the tree"
  on public.people for all
  to authenticated
  using (true) with check (true);

-- Anyone may file a suggestion, but only ever as 'pending'. They cannot
-- pre-approve their own change, and they cannot read the queue back.
drop policy if exists "anyone suggests" on public.suggestions;
create policy "anyone suggests"
  on public.suggestions for insert
  to anon, authenticated
  with check (status = 'pending' and reviewed_at is null);

drop policy if exists "owner reads the queue" on public.suggestions;
create policy "owner reads the queue"
  on public.suggestions for select
  to authenticated
  using (true);

drop policy if exists "owner reviews the queue" on public.suggestions;
create policy "owner reviews the queue"
  on public.suggestions for update
  to authenticated
  using (true) with check (true);


-- ── Public pending counts ──────────────────────────────────────────────
-- The tree shows a small badge when a person has suggestions awaiting
-- review, without exposing the suggestions themselves.
--
-- This was once a SECURITY DEFINER view. That worked, but a definer view
-- bypasses the caller's RLS by design, so any later edit to it risks leaking
-- the suggestion rows behind it. Caching the count on people is safer and
-- cheaper: the public can already read people, so the badge needs no extra
-- grant and no second request.

create or replace function public.refresh_pending_count()
returns trigger language plpgsql
security definer
set search_path = ''
as $$
declare pid text;
begin
  pid := coalesce(new.person_id, old.person_id);
  update public.people p
     set pending_count = (
           select count(*) from public.suggestions s
            where s.person_id = pid and s.status = 'pending')
   where p.id = pid;
  return null;
end $$;

drop trigger if exists suggestions_count on public.suggestions;
create trigger suggestions_count
  after insert or update or delete on public.suggestions
  for each row execute function public.refresh_pending_count();

-- Supabase publishes every public-schema function at /rest/v1/rpc/<name>.
-- These two are trigger bodies and must not be callable by a client.
revoke execute on function public.refresh_pending_count() from public, anon, authenticated;
revoke execute on function public.touch_updated_at()      from public, anon, authenticated;

-- Recompute from scratch, so re-running this file also repairs any drift.
update public.people p
   set pending_count = coalesce((
         select count(*) from public.suggestions s
          where s.person_id = p.id and s.status = 'pending'), 0);

drop view if exists public.pending_counts;


-- ── Done ───────────────────────────────────────────────────────────────
-- Next: run supabase/seed.sql, then create your admin user under
-- Authentication → Users → Add user (leave "Auto Confirm" on).
