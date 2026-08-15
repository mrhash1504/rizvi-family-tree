---
name: backup_restore
description: How to backup and restore the live Supabase database for the Rizvi Family Tree
metadata: 
  node_type: memory
  type: project
  originSessionId: 59833c74-2e79-4c14-a128-d291e4c16aaf
  modified: 2026-08-15T02:01:36.236Z
---

# Backup & Restore Procedures

## Automatic Backups (Git Snapshots)

### How It Works
The file `tools/snapshot.js` exports all 104 people from the live Supabase database and writes them to `assets/snapshot.js`, which is then committed to git.

**Benefits**:
- Permanent, versioned history in git
- No backup files to manage manually
- Uses only the public anon key (no credentials)
- Keeps offline fallback current
- Prevents free-tier pause (weekly read = activity)

### Running Manually
```bash
cd "C:\Users\Lenovo\OneDrive\Desktop\Family Tree"
node tools/snapshot.js
```

Output: `assets/snapshot.js` is updated with current database state, ready to commit.

### Setting Up Automatic Runs
The snapshot should run weekly. Options:

#### Option A: GitHub Actions (Recommended)
If the repo is on GitHub, add a workflow file (`.github/workflows/snapshot.yml`):

```yaml
name: Weekly Snapshot
on:
  schedule:
    - cron: '0 2 * * 1'  # Every Monday at 2 AM UTC

jobs:
  snapshot:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: node tools/snapshot.js
      - run: |
          git config user.name "Snapshot Bot"
          git config user.email "action@github.com"
          git add assets/snapshot.js
          git commit -m "Snapshot the family tree ($(date +%Y-%m-%d))" || echo "No changes"
          git push
```

#### Option B: Local Cron Job (Linux/Mac)
Add to crontab:
```bash
crontab -e
# Add this line:
0 2 * * 1 cd /path/to/family-tree && node tools/snapshot.js && git add assets/snapshot.js && git commit -m "Snapshot" && git push
```

#### Option C: Windows Task Scheduler
Create a batch file (`backup.bat`):
```batch
cd "C:\Users\Lenovo\OneDrive\Desktop\Family Tree"
node tools/snapshot.js
git add assets/snapshot.js
git commit -m "Snapshot the family tree (%date%)"
git push
```
Then schedule it via Task Scheduler to run weekly.

---

## Manual Export (Full Database Backup)

### Export from Supabase Dashboard
If you need a complete backup outside of git:

1. Go to **supabase.com** → your project
2. **Table Editor** → **people**
3. Click the **Download** button (or export as JSON)
4. Save as `family-tree-backup-YYYY-MM-DD.json`

This exports all 104 people with all metadata.

### Export via Curl (From Command Line)
```bash
curl -H "apikey: YOUR_ANON_KEY" \
  "https://rwseryuxuvrcoddntnho.supabase.co/rest/v1/people?select=*" \
  > family-tree-backup.json
```

(Get YOUR_ANON_KEY from assets/config.js)

---

## Restoring from Backup

### Scenario 1: Restore Individual Records (Recommended for Small Fixes)

If a few records were corrupted, restore them manually:

1. Open `/admin.html` in the browser
2. Find the person in the tree
3. Click their name and edit the fields
4. Click **Approve & lock** to save and freeze the field

### Scenario 2: Full Database Restore (Nuclear Option)

If the entire database was wiped or corrupted:

#### Step 1: Access Supabase SQL Editor
1. Go to **supabase.com** → your project
2. Open **SQL Editor** → **New query**

#### Step 2: Delete Old Data (CAREFUL!)
```sql
DELETE FROM suggestions;
DELETE FROM people;
```

#### Step 3: Restore from Backup
If you have `family-tree-backup-2026-08-14.json` (from Downloads folder):

```bash
# Convert JSON to INSERT statements
node tools/restore-from-backup.js family-tree-backup-2026-08-14.json
```

(Note: You may need to create `tools/restore-from-backup.js` if it doesn't exist; see below)

#### Step 4: Run the SQL
Copy the output SQL and paste it into Supabase SQL Editor, then click **Run**.

---

## Restore Script (To Create)

Create `tools/restore-from-backup.js`:

```javascript
const fs = require('fs');

const backupFile = process.argv[2];
if (!backupFile) {
  console.error('Usage: node tools/restore-from-backup.js <backup.json>');
  process.exit(1);
}

const backup = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
const people = backup.people || backup;

if (!Array.isArray(people) || people.length === 0) {
  console.error('Invalid backup file: no people array found');
  process.exit(1);
}

console.log('-- Restore script generated from backup');
console.log('-- Paste this into Supabase SQL Editor and click Run');
console.log();

for (const person of people) {
  const cols = Object.keys(person).map(k => `"${k}"`).join(', ');
  const vals = Object.values(person).map(v => {
    if (v === null || v === undefined) return 'NULL';
    if (typeof v === 'string') return `'${v.replace(/'/g, "''")}'`;
    if (Array.isArray(v)) return `'${JSON.stringify(v).replace(/'/g, "''")}'`;
    return v;
  }).join(', ');
  console.log(`INSERT INTO people (${cols}) VALUES (${vals}) ON CONFLICT(id) DO UPDATE SET ` +
    Object.keys(person)
      .filter(k => k !== 'id')
      .map(k => `"${k}" = EXCLUDED."${k}"`)
      .join(', ') + ';');
}
```

Then run:
```bash
node tools/restore-from-backup.js family-tree-backup-2026-08-14.json > restore.sql
```

This outputs SQL you can paste into Supabase.

---

## Prevention: Disaster Recovery Checklist

- [ ] Run `node tools/snapshot.js` weekly (or set up automatic runs)
- [ ] Commit snapshots to git
- [ ] Push to GitHub (so it's not just local)
- [ ] Keep at least one manual backup downloaded and stored safely
- [ ] Monitor Supabase free-tier usage (if idle > 7 days, it pauses)
- [ ] Set up alerts if database stops responding

---

## Current Backups

| Source | Location | Last Updated |
|--------|----------|---------------|
| Git snapshot | `assets/snapshot.js` | 2026-08-10 (needs refresh) |
| Manual export | `family-tree-backup-2026-08-14.json` | 2026-08-14 (in Downloads) |
| Supabase live | `https://rwseryuxuvrcoddntnho.supabase.co` | Live (104 people, 82 pending) |

**Action**: Run `node tools/snapshot.js` to update the git snapshot to today's date.
