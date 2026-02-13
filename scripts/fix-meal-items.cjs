const { createClient } = require('@libsql/client');

const c = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  // Fix meal_items table - drop and recreate with correct schema
  await c.execute('DROP TABLE IF EXISTS meal_items');
  await c.execute(`CREATE TABLE meal_items (
    id text PRIMARY KEY NOT NULL,
    meal_id text NOT NULL,
    food_id text,
    food_name text NOT NULL,
    portion integer NOT NULL,
    unit text DEFAULT 'g',
    calories integer,
    protein integer,
    carbs integer,
    fat integer,
    FOREIGN KEY (meal_id) REFERENCES meals(id) ON UPDATE no action ON DELETE cascade
  )`);
  console.log('meal_items table fixed');

  // Verify
  const r = await c.execute('PRAGMA table_info(meal_items)');
  r.rows.forEach(row => console.log(' ', row.name, row.type));
  c.close();
}

main().catch(e => { console.error(e); process.exit(1); });
