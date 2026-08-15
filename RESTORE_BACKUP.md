# Restoring the Backup (2026-08-14)

You have a complete backup of your family tree at:
```
C:\Users\Lenovo\Downloads\family-tree-backup-2026-08-14.json
```

This contains all **104 people** and all their records. Here's how to restore it to your live Supabase database.

---

## Option 1: Manual Restore via Supabase Dashboard (Easiest)

### Step 1: Log into Supabase
1. Go to **supabase.com**
2. Sign in with your account
3. Open your **Rizvi Family Tree** project

### Step 2: Clear Old Data (If Corrupted)
1. Click **SQL Editor** in the left sidebar
2. Click **New query**
3. Paste this and click **Run** (skip if data looks fine):
   ```sql
   DELETE FROM suggestions;
   DELETE FROM people;
   ```

### Step 3: Restore Records
1. Click **Table Editor** in the left sidebar
2. Click on the **people** table
3. Look for an **Import** button (often in the top-right toolbar)
4. Upload `family-tree-backup-2026-08-14.json`
5. Supabase should detect the schema and insert/update the records

---

## Option 2: Use the Python Script (More Control)

If you have Python installed locally:

```bash
cd "C:\Users\Lenovo\Downloads"
python3 << 'EOF'
import json

# Read backup
with open('family-tree-backup-2026-08-14.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

people = data.get('people', data if isinstance(data, list) else [])

# Generate SQL
with open('restore-2026-08-14.sql', 'w', encoding='utf-8') as out:
    out.write(f'-- Restore SQL for {len(people)} people\n')
    
    for person in people:
        cols = [f'"{k}"' for k, v in person.items() if v is not None]
        vals = []
        
        for k, v in person.items():
            if v is None:
                continue
            if isinstance(v, str):
                vals.append(f"'{v.replace(chr(39), chr(39)+chr(39))}'")
            elif isinstance(v, (list, dict)):
                vals.append(f"'{json.dumps(v).replace(chr(39), chr(39)+chr(39))}'")
            else:
                vals.append(str(v))
        
        col_list = ', '.join(cols)
        val_list = ', '.join(vals)
        updates = ', '.join([f'"{k}" = EXCLUDED."{k}"' for k in person if k != 'id' and person[k] is not None])
        
        out.write(f'INSERT INTO people ({col_list}) VALUES ({val_list}) ON CONFLICT("id") DO UPDATE SET {updates};\n')

print("✅ Generated restore-2026-08-14.sql")
print("   Paste the contents into Supabase SQL Editor and run")
EOF
```

Then:
1. Open `restore-2026-08-14.sql` in a text editor
2. Copy all the SQL
3. In Supabase, **SQL Editor** → **New query**
4. Paste the SQL and click **Run**

---

## Option 3: Use the Restore Script (JavaScript/Node)

If you have Node.js installed:

```bash
cd "C:\Users\Lenovo\OneDrive\Desktop\Family Tree"
node tools/restore-from-backup.js "C:\Users\Lenovo\Downloads\family-tree-backup-2026-08-14.json" > tools/restore-2026-08-14.sql
```

Then open `tools/restore-2026-08-14.sql`, copy it, and paste into Supabase SQL Editor.

---

## Verify the Restore Worked

After running the restore SQL:

1. In Supabase, click **Table Editor** → **people**
2. Check that you see **104 records**
3. Spot-check a few records (click a person, verify their fields)
4. Go to your public tree (`index.html`) and refresh—the data should load from the database

---

## If Something Goes Wrong

**Issue**: "Constraint violation" or "Duplicate key error"

**Fix**: The data already exists and UPSERT is working (good!). This is normal. Just wait for the query to finish.

**Issue**: "Column does not exist"

**Fix**: Run `schema.sql` first, then run the restore SQL:
1. New query → paste `supabase/schema.sql` contents → Run
2. New query → paste restore SQL → Run

**Issue**: Empty database after restore

**Fix**: 
1. Check that the backup file is valid: `type family-tree-backup-2026-08-14.json | head`
2. Make sure the SQL error message at the top doesn't indicate truncation
3. Try importing via Table Editor UI instead (Option 1)

---

## After Restore: Update the Git Snapshot

Once the database is restored, update your git snapshot to reflect the current state:

```bash
cd "C:\Users\Lenovo\OneDrive\Desktop\Family Tree"
node tools/snapshot.js
git add assets/snapshot.js
git commit -m "Restore snapshot after database recovery"
git push
```

This ensures your git history has the restored state as well.

---

**Questions?** Check `memory/backup_restore.md` for more details.
