// Add missing columns to Turso that exist in schema.ts but not in the DB
const { createClient } = require('@libsql/client');

const c = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const alterStatements = [
  // students table - missing demographics columns
  "ALTER TABLE students ADD COLUMN birth_date integer",
  "ALTER TABLE students ADD COLUMN gender text",
  "ALTER TABLE students ADD COLUMN height integer",
  "ALTER TABLE students ADD COLUMN weight integer",
];

async function main() {
  // First check current columns
  const before = await c.execute('PRAGMA table_info(students)');
  const existingCols = before.rows.map(r => r.name);
  console.log('Current students columns:', existingCols);

  for (const stmt of alterStatements) {
    const colName = stmt.match(/ADD COLUMN (\w+)/)?.[1];
    if (existingCols.includes(colName)) {
      console.log(`  SKIP: ${colName} already exists`);
      continue;
    }
    try {
      await c.execute(stmt);
      console.log(`  OK: added ${colName}`);
    } catch (e) {
      if (e.message?.includes('duplicate column')) {
        console.log(`  SKIP: ${colName} already exists`);
      } else {
        console.error(`  FAIL: ${e.message}`);
        throw e;
      }
    }
  }

  // Verify
  const after = await c.execute('PRAGMA table_info(students)');
  console.log('\nFinal students columns:', after.rows.map(r => r.name));
  c.close();
}

main().catch(e => { console.error(e); process.exit(1); });
