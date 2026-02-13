// Test the exact queries that page.tsx does
const { createClient } = require('@libsql/client');

const c = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  const testUserId = 'test_user_123';
  
  console.log('=== Testing Dashboard Queries ===\n');

  // 1. Test: Find student by email
  console.log('1. db.query.students.findFirst (by email)...');
  try {
    const r = await c.execute({
      sql: "SELECT * FROM students WHERE email = ? LIMIT 1",
      args: ['test@test.com']
    });
    console.log('   OK - rows:', r.rows.length);
  } catch (e) {
    console.error('   FAIL:', e.message);
  }

  // 2. Test: Count active students
  console.log('2. SELECT count(*) FROM students WHERE trainer_id = ? AND active = ?...');
  try {
    const r = await c.execute({
      sql: "SELECT count(*) as count FROM students WHERE trainer_id = ? AND active = 1",
      args: [testUserId]
    });
    console.log('   OK - count:', r.rows[0]?.count);
  } catch (e) {
    console.error('   FAIL:', e.message);
  }

  // 3. Test: Sum payments
  console.log('3. SELECT sum(amount) FROM payments...');
  try {
    const r = await c.execute({
      sql: "SELECT sum(amount) as total FROM payments WHERE trainer_id = ? AND status = 'paid'",
      args: [testUserId]
    });
    console.log('   OK - total:', r.rows[0]?.total);
  } catch (e) {
    console.error('   FAIL:', e.message);
  }

  // 4. Test: New signups count
  console.log('4. SELECT count(*) FROM students (new signups)...');
  try {
    const r = await c.execute({
      sql: "SELECT count(*) as count FROM students WHERE trainer_id = ?",
      args: [testUserId]
    });
    console.log('   OK - count:', r.rows[0]?.count);
  } catch (e) {
    console.error('   FAIL:', e.message);
  }

  // 5. Test: Students with plan (JOIN-like via with: { plan: true })
  console.log('5. SELECT students with plan...');
  try {
    const r = await c.execute({
      sql: "SELECT s.id, s.name, s.plan_end, p.name as plan_name FROM students s LEFT JOIN plans p ON s.plan_id = p.id WHERE s.trainer_id = ? AND s.active = 1",
      args: [testUserId]
    });
    console.log('   OK - rows:', r.rows.length);
  } catch (e) {
    console.error('   FAIL:', e.message);
  }

  // 6. Test: INSERT trainer (syncTrainer upsert)
  console.log('6. INSERT INTO trainers ON CONFLICT...');
  try {
    const r = await c.execute({
      sql: `INSERT INTO trainers (id, name, email, created_at, updated_at) 
            VALUES (?, ?, ?, strftime('%s', 'now'), strftime('%s', 'now'))
            ON CONFLICT(id) DO UPDATE SET name = excluded.name, email = excluded.email, updated_at = strftime('%s', 'now')
            RETURNING *`,
      args: ['test_trainer_id', 'Test Trainer', 'trainer@test.com']
    });
    console.log('   OK - returned:', r.rows.length, 'rows');
    if (r.rows[0]) console.log('   Data:', JSON.stringify(r.rows[0]));
  } catch (e) {
    console.error('   FAIL:', e.message);
  }

  // Cleanup test trainer
  await c.execute({ sql: "DELETE FROM trainers WHERE id = ?", args: ['test_trainer_id'] });
  
  // 7. Test all table access
  console.log('\n7. Testing all tables exist...');
  const tables = await c.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
  console.log('   Tables:', tables.rows.map(r => r.name).join(', '));
  console.log('   Total:', tables.rows.length);

  c.close();
  console.log('\n=== All tests completed ===');
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
