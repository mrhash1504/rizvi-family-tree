# Setting up the Rizvi Family Tree site

Two parts: a database (Supabase, free) and hosting (Netlify, free). About
15 minutes end to end. You do not need to install anything.

Until you finish step 1, the site still runs — it just works in **local
mode**, where everything is saved in your own browser and nothing is shared.
Good for having a look; not good for the family.

---

## 1. Create the database

1. Go to **supabase.com**, sign up, and create a new project.
   Pick a region near most of the family. Save the database password
   somewhere safe — you will not need it for this site, but Supabase will
   ask for it later if you ever want direct access.

2. Wait for the project to finish provisioning (a minute or two).

3. Open **SQL Editor** in the left sidebar, click **New query**, paste in the
   whole of `supabase/schema.sql`, and click **Run**.
   You should see "Success. No rows returned."

4. New query again. Paste the whole of `supabase/seed.sql` and **Run**.
   This loads all 39 people from the document.

5. Check it worked: **Table Editor → people**. You should see the family,
   Mir Ali Hussain Rizvi first, and columns in pairs (`name` / `name_ur`,
   `birth` / `birth_ur`, and so on).

### Re-running these files later

Both are safe to run again as many times as you like, and running them again
is how you pick up changes:

- **`schema.sql`** adds any column or constraint that didn't exist before and
  leaves everything else alone. It never drops a table or deletes a row.
- **`seed.sql`** fills in fields that are currently *empty* and never
  overwrites a value the family has already entered or you have approved.

So after any change on my side, re-run both in that order. If you only run
`seed.sql` and a new column is missing, you'll get an error naming that
column — run `schema.sql` first and try again.

---

## 2. Create your admin login

1. **Authentication → Users → Add user → Create new user**.
2. Enter your email and a password you will remember.
3. Turn **Auto Confirm User** on, so you don't have to click a confirmation
   email.
4. Create the user.

That email and password are what you'll use on the review queue page. Do not
share them — anyone with them can edit the tree directly.

---

## 3. Connect the site to the database

1. In Supabase go to **Project Settings → Data API**.
2. Copy the **Project URL** and the **anon / public** API key.
3. Open `assets/config.js` in a text editor and paste them in:

   ```js
   window.RFT_CONFIG = {
     SUPABASE_URL: 'https://abcdefgh.supabase.co',
     SUPABASE_ANON_KEY: 'eyJhbGciOi...',
     ...
   };
   ```

4. Save the file.

**On the anon key being public:** it is meant to be. It only identifies your
project. What actually protects the data is the row-level security in
`schema.sql` — with that key alone, a visitor can read the tree and file a
suggestion, and nothing else. They cannot edit the tree, cannot read the
review queue, and cannot approve their own suggestion.

---

## 4. Put it online

Either **Cloudflare Pages** or **Netlify** works; both are free, both serve
unlimited visitors, and both take a drag-and-drop. Cloudflare is slightly
faster in South Asia and the Gulf, which is where most of the family is, so
that's the one I'd pick.

**Cloudflare Pages:** sign up at **dash.cloudflare.com** → *Workers & Pages*
→ *Create* → *Pages* → *Upload assets*. Name it, drag this folder in, deploy.

**Netlify:** sign up at **app.netlify.com** → *Add new site* → *Deploy
manually*, and drag this folder onto the drop zone. Rename the site under
*Site configuration → Change site name*.

Either way you get a link like `https://rizvi-family-tree.pages.dev`. That
link is what you send to the family. To publish a later change, drag the
folder in again.

### About who can see it

There is no login on the public tree — that was deliberate, because a
sign-in step is exactly what stops relatives from bothering. So treat the
link as the key: **anyone who has it can read the tree**, including birth
years of the children.

What the site does do is stay out of search engines. `robots.txt` and a
`noindex` tag mean nobody finds it by googling family names — it has to be
handed to them. Within the family, the link will get forwarded, and that is
a social matter rather than a technical one.

If you ever change your mind, both hosts can put an email-code gate in front
of the whole site without touching the code.

---

## 5. Day to day

**Relatives** open the link, tap anyone, and press *Suggest a change*. They
fill in what they know and their name. Nothing they type goes live.

**You** open `/admin.html` on the same site — for example
`https://rizvi-family-tree.netlify.app/admin.html` — sign in with the email
and password from step 2, and you'll see everything waiting.

Each submission shows who sent it, what the field says now, and what they're
proposing. Three buttons:

| Button | What it does |
|---|---|
| **Approve** | Writes the change to the tree. The field stays open to future edits. |
| **Approve & lock** | Writes the change *and* freezes that field. Relatives see a padlock and cannot edit it. |
| **Reject** | Discards it. Nothing changes. |

Use **Approve & lock** once a detail is settled — a confirmed birth date, a
spelling you've checked. Use plain **Approve** while something is still an
estimate, so the family can keep refining it.

The **Manage locks** tab lets you lock or unlock any field directly, without
waiting for a suggestion. Locks are per field, not per person: you can freeze
Syed Ghulam Raza Rizvi's death date while leaving his children's names open.

Bookmark the admin page. There is no notification email — check it when you
think of it, or ask relatives to text you when they've sent something.

---

## Changing the underlying record

`assets/data.js` holds the transcription of the original Word document. It is
the fallback the site shows if the database is ever unreachable, and it is
what `seed.sql` is built from.

If you correct something there, regenerate the SQL:

```bash
node tools/gen-seed-sql.js
```

Re-running `seed.sql` in Supabase will **not** overwrite rows that already
exist, so approved family corrections are never clobbered. To force a person
back to the document version, delete that row in the Table Editor first.

---

## Previewing locally

```bash
node serve.js
```

Then open `http://localhost:5178`. Opening `index.html` straight off the disk
also mostly works, but some browsers restrict local files, so the little
server is more reliable.

---

## If something goes wrong

**"Failed to fetch" in the SQL Editor.** This is your browser failing to
reach `api.supabase.com`, the address the Supabase dashboard talks to. It is
not your database and not this site — the site uses a different address
(`<your-project>.supabase.co`), so relatives can be browsing the tree
perfectly while the dashboard is unreachable for you.

Work through these in order:

1. Check **status.supabase.com**. If it says All Systems Operational, the
   problem is local to your browser or network.
2. Reload the page and run the query again. A long paste over a slow
   connection can time out partway.
3. Try a private/incognito window. Ad blockers and privacy extensions block
   `api.supabase.com` fairly often, and this is the single most common cause.
4. Switch networks — phone hotspot instead of home or office wifi. Some ISPs
   and most corporate firewalls block it.
5. If you use a VPN, try with it off, and then on.

Because both SQL files are safe to re-run, a half-finished attempt costs you
nothing. Just run the whole file again from the top.

**An error naming a column that doesn't exist.** You ran `seed.sql` against
an older `schema.sql`. Run `schema.sql` first, then `seed.sql`.

**Urdu appears as `Ø³ÛŒØ¯`.** The SQL files are UTF-8. Copy them from a
browser, VS Code, or Notepad — not from a terminal window that is set to a
different codepage.

**Relatives get "Could not send".** Usually the `field_known` constraint on
an older `suggestions` table rejecting a field name added later. Re-run
`schema.sql`, which rebuilds that constraint.

## A note on Urdu

The record is fully bilingual. **Every** field — name, born, died, place of
birth, lived in, spouse, and the "About them" biography — exists twice, once
in English and once in Urdu, and all 39 people are filled in on both sides.
Switching language flips the interface right-to-left and swaps the whole
record over.

**The form follows the reader.** In Urdu, the Urdu fields come first and the
English ones are folded into a collapsed *In English* section marked
optional. A relative who reads no English can open the site, switch to Urdu,
and fill in a complete profile without ever seeing an English input. In
English mode it works the other way round.

I translated everything by hand rather than running it through a translator,
because auto-translation garbles proper nouns — "Phool" comes back as the
word for flower, which is the example you gave. You can still correct
anything you disagree with: it's all editable, same as any other field.

Where an Urdu value is genuinely missing, the English shows with a small
**EN** marker so the gap is visible rather than silent.

Dates and place names in text that has no Urdu version yet — Lucknow,
Murshidabad, Karachi, "b.", "d." — are converted from a fixed dictionary in
`assets/i18n.js`. Add to the `UR_PHRASES` list if you want more terms
handled.
