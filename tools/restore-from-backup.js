/* Restore the live database from a backup JSON file.
 *
 * Usage: node tools/restore-from-backup.js family-tree-backup-2026-08-14.json
 *
 * This generates SQL INSERT statements (with UPSERT logic) that restore all
 * records from the backup. Paste the output into Supabase SQL Editor and run it.
 *
 * The script is safe: it won't delete existing data, only insert or overwrite.
 * Suggestions are not restored (they are ephemeral; only the approved data matters).
 */

const fs = require('fs');
const path = require('path');

const backupFile = process.argv[2];
if (!backupFile) {
  console.error('Usage: node tools/restore-from-backup.js <backup.json>');
  process.exit(1);
}

let people = null;
try {
  const raw = fs.readFileSync(backupFile, 'utf8');
  const parsed = JSON.parse(raw);
  people = parsed.people || parsed; // Handle both formats
  if (!Array.isArray(people)) {
    throw new Error('Expected people array');
  }
} catch (err) {
  console.error(`Error reading backup: ${err.message}`);
  process.exit(1);
}

if (people.length === 0) {
  console.error('Backup file is empty or has no people');
  process.exit(1);
}

console.log('-- Generated restore SQL from backup file');
console.log(`-- Contains ${people.length} people`);
console.log('-- Paste this into Supabase SQL Editor and click Run');
console.log('-- Uses UPSERT logic: inserts new records or overwrites existing ones by id\n');

const sqlLines = [];

for (const person of people) {
  const cols = Object.keys(person)
    .filter(k => person[k] !== undefined) // Skip undefined fields
    .map(k => `"${k}"`)
    .join(', ');

  const vals = Object.keys(person)
    .filter(k => person[k] !== undefined)
    .map(k => {
      const v = person[k];
      if (v === null) return 'NULL';
      if (typeof v === 'string') {
        // Escape single quotes by doubling them
        const escaped = v.replace(/'/g, "''");
        return `'${escaped}'`;
      }
      if (Array.isArray(v)) {
        const json = JSON.stringify(v).replace(/'/g, "''");
        return `'${json}'`;
      }
      return v;
    })
    .join(', ');

  // Build the UPDATE clause for UPSERT
  const updateCols = Object.keys(person)
    .filter(k => k !== 'id' && person[k] !== undefined)
    .map(k => `"${k}" = EXCLUDED."${k}"`)
    .join(', ');

  const sql = `INSERT INTO people (${cols}) VALUES (${vals}) ON CONFLICT("id") DO UPDATE SET ${updateCols};`;
  sqlLines.push(sql);
}

console.log(sqlLines.join('\n'));
console.log('\n-- Restore complete');
