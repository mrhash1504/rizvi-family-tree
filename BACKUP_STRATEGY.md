# Disaster Recovery & Cloud Backup Strategy

**Problem**: Local SSD corruption = loss of local conversation history and memory files  
**Solution**: Multi-layer cloud backup so nothing is ever lost again

---

## Layer 1: Claude Conversations (Already Protected) ✅

### Where your chats live:
- **Claude's cloud servers** — Every conversation you have with Claude (including all our family tree work) is automatically saved to Anthropic's servers
- **Accessible at**: claude.ai or via Claude Code desktop app
- **Survives**: Any local computer failure, SSD corruption, device loss

### How to access:
1. Go to **claude.ai** 
2. Click **Conversation History** (sidebar)
3. Search by keywords: "family tree", "rizvi", "supabase"
4. All chats are there, searchable, and permanent

**Status**: ✅ Your conversation history is already cloud-backed up. You own this data.

---

## Layer 2: Memory Files Backup (New — Set Up Now)

### Current location:
```
C:\Users\Lenovo\.claude\projects\...\memory\
```

### The problem:
These are local files that would be lost if your laptop SSD fails again.

### The solution:
**Back up memory files to OneDrive (which you have):**

```bash
cd "C:\Users\Lenovo\OneDrive\Desktop\Family Tree"

# Copy all memory files to OneDrive
Copy-Item -Recurse "C:\Users\Lenovo\.claude\projects\C--Users-Lenovo-OneDrive-Desktop-Family-Tree\memory" `
  -Destination "C:\Users\Lenovo\OneDrive\Desktop\Family Tree\memory-backups" -Force
```

Then commit to git:
```bash
git add memory-backups/
git commit -m "Backup memory files to OneDrive for disaster recovery"
git push
```

**Result**: 
- ✅ Memory files synced to OneDrive (cloud)
- ✅ Memory files synced to GitHub (version control)
- ✅ Memory files survive any local hardware failure

---

## Layer 3: Conversation Transcripts (Export & Archive)

### Export a conversation as markdown:

Since Claude doesn't have built-in export, use this workaround:

1. Open the conversation on **claude.ai**
2. Select all text (Ctrl+A)
3. Copy to a markdown file:
   ```
   C:\Users\Lenovo\OneDrive\Desktop\Family Tree\chat-archives\family-tree-setup-2026-08-14.md
   ```
4. Commit to git:
   ```bash
   git add chat-archives/
   git commit -m "Archive: Family tree setup conversation (2026-08-14)"
   git push
   ```

### For regular archiving:
- When you finish a significant conversation, export it
- Save as `chat-archives/<topic>-<date>.md`
- Commit to git weekly

---

## Layer 4: Database Backups (Already Set Up) ✅

Your Supabase database has multiple protection layers:

1. **Weekly snapshots** → `assets/snapshot.js` → committed to git ✅
2. **Manual exports** → `family-tree-backup-2026-08-14.json` → OneDrive ✅
3. **Supabase's own backups** → Available via Supabase dashboard ✅

---

## Layer 5: GitHub as Central Archive

All of the above flows into **GitHub**, which is:
- ✅ Cloud-hosted (survives your laptop failure)
- ✅ Version-controlled (every change is tracked)
- ✅ Permanently archived (GitHub is the longest-lived code hosting)

**Current repo**: `https://github.com/mrhash1504/rizvi-family-tree.git`

**What it contains**:
- ✅ All source code
- ✅ Weekly database snapshots
- ✅ Memory files (once synced)
- ✅ Chat archive transcripts (when added)
- ✅ All commit history

---

## Complete Backup Workflow

### Daily (automatic):
- Claude conversations → Anthropic's servers ✅ (you do nothing)
- OneDrive files → Microsoft's cloud ✅ (syncs automatically)

### Weekly (manual, takes 5 minutes):
```bash
cd "C:\Users\Lenovo\OneDrive\Desktop\Family Tree"

# 1. Run database snapshot
node tools/snapshot.js

# 2. Sync memory files to OneDrive
Copy-Item -Recurse ".claude/projects/.../memory" "OneDrive/Family Tree/memory-backups" -Force

# 3. Commit everything to git
git add -A
git commit -m "Weekly backup: database snapshot + memory files ($(Get-Date -Format 'yyyy-MM-dd'))"
git push
```

### When finishing a major conversation:
```bash
# Export the Claude conversation as markdown
# Place it in: C:\Users\Lenovo\OneDrive\Desktop\Family Tree\chat-archives\

git add chat-archives/
git commit -m "Archive: [conversation title] ([date])"
git push
```

---

## Recovery Plan

If your laptop SSD fails again:

1. **Restore source code** → `git clone https://github.com/mrhash1504/rizvi-family-tree.git`
2. **Restore database** → Run restore SQL from `tools/restore-2026-08-14.sql`
3. **Restore memory files** → Download from `memory-backups/` in git repo
4. **Restore conversations** → All chats available on claude.ai
5. **Restore all data** → Available from OneDrive, GitHub, Supabase

**Total recovery time**: < 15 minutes on a new machine

---

## Recommended Tools Setup

### Automatic OneDrive sync (already have):
- ✅ OneDrive Desktop folder syncs automatically
- Any file you save to `C:\Users\Lenovo\OneDrive\` is cloud-backed up

### GitHub Desktop (optional, makes git easier):
- Download: https://desktop.github.com/
- Simplifies commit/push workflow
- Still uses command line but with a UI

### Scheduled backup script (optional, advanced):
If you want the weekly backup to run automatically, create a Windows Task Scheduler job:

**File**: `C:\Users\Lenovo\OneDrive\Desktop\Family Tree\backup.ps1`
```powershell
cd "C:\Users\Lenovo\OneDrive\Desktop\Family Tree"

# Run snapshot
node tools/snapshot.js

# Sync memory files
Copy-Item -Recurse ".claude/projects/C--Users-Lenovo-OneDrive-Desktop-Family-Tree/memory" `
  -Destination "memory-backups" -Force

# Commit
git add -A
git commit -m "Automatic weekly backup ($(Get-Date -Format 'yyyy-MM-dd HH:mm'))" -ErrorAction SilentlyContinue
git push
```

Then schedule it to run every Monday at 2 AM via Task Scheduler.

---

## Summary: Where Everything Lives

| What | Location | Cloud? | Survives SSD Failure? |
|------|----------|--------|----------------------|
| Claude conversations | claude.ai + Anthropic servers | ✅ Yes | ✅ Yes |
| Memory files | `.claude/projects/.../memory/` | ❌ Local only | ❌ No → **Back up to OneDrive** |
| Source code | GitHub repo | ✅ Yes | ✅ Yes |
| Database snapshots | GitHub (assets/snapshot.js) | ✅ Yes | ✅ Yes |
| Database (live) | Supabase | ✅ Yes | ✅ Yes |
| Chat transcripts | OneDrive/GitHub (when archived) | ✅ Yes | ✅ Yes |

---

## Action Items (Do These Now)

1. **Sync memory files to OneDrive**:
   ```powershell
   Copy-Item -Recurse "C:\Users\Lenovo\.claude\projects\C--Users-Lenovo-OneDrive-Desktop-Family-Tree\memory" `
     -Destination "C:\Users\Lenovo\OneDrive\Desktop\Family Tree\memory-backups" -Force
   ```

2. **Commit to git**:
   ```bash
   cd "C:\Users\Lenovo\OneDrive\Desktop\Family Tree"
   git add memory-backups/
   git commit -m "Backup memory files for disaster recovery"
   git push
   ```

3. **Verify**: Check GitHub → your repo → `memory-backups/` folder should be there

4. **Bookmark this file** for reference: `BACKUP_STRATEGY.md`

---

**Result**: You now have 3 independent copies of everything:
- Anthropic's servers (conversations)
- OneDrive (automatic sync)
- GitHub (version control)

If your laptop dies, your data survives. ✅
