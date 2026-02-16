/**
 * Seed script: Import TACO (Tabela Brasileira de Composição de Alimentos) data
 * into the `foods` table in Turso production database.
 *
 * Data source: https://github.com/raulfdm/taco-api/tree/main/references/csv
 *
 * Usage:
 *   node scripts/seed-taco-foods.mjs
 *
 * Requires env vars: TURSO_DATABASE_URL, TURSO_AUTH_TOKEN
 */

import { createClient } from '@libsql/client';
import { randomUUID } from 'crypto';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env.local if present
try {
  const envPath = resolve(process.cwd(), '.env.local');
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    // Remove surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
} catch { /* no .env.local, that's fine */ }

// ─── Config ────────────────────────────────────────────────────────────────────
const GITHUB_RAW =
  'https://raw.githubusercontent.com/raulfdm/taco-api/main/references/csv';

const CSV_URLS = {
  categories: `${GITHUB_RAW}/categories.csv`,
  food: `${GITHUB_RAW}/food.csv`,
  nutrients: `${GITHUB_RAW}/nutrients.csv`,
};

// ─── CSV Parser (simple, handles quoted fields) ────────────────────────────────
function parseCSV(text) {
  const lines = text.split('\n').filter((l) => l.trim() !== '');
  if (lines.length === 0) return [];

  const headers = parseCSVLine(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row = {};
    headers.forEach((h, idx) => {
      row[h.trim()] = values[idx]?.trim() ?? '';
    });
    rows.push(row);
  }
  return rows;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function toInt(val) {
  if (val === '' || val === undefined || val === null) return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : Math.round(n);
}

function toIntX100(val) {
  if (val === '' || val === undefined || val === null) return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : Math.round(n * 100);
}

// ─── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const url = (process.env.TURSO_DATABASE_URL || '').replace(/[\r\n]/g, '');
  const authToken = (process.env.TURSO_AUTH_TOKEN || '').replace(/[\r\n]/g, '');

  if (!url || !authToken) {
    console.error('❌ Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN');
    process.exit(1);
  }

  console.log(`🔗 Connecting to: ${url}`);
  const client = createClient({ url, authToken });

  // 1. Fetch CSV data from GitHub
  console.log('📥 Fetching TACO CSV data from GitHub...');
  const [categoriesText, foodText, nutrientsText] = await Promise.all([
    fetch(CSV_URLS.categories).then((r) => r.text()),
    fetch(CSV_URLS.food).then((r) => r.text()),
    fetch(CSV_URLS.nutrients).then((r) => r.text()),
  ]);

  const categories = parseCSV(categoriesText);
  const foods = parseCSV(foodText);
  const nutrients = parseCSV(nutrientsText);

  console.log(
    `  ✅ ${categories.length} categories, ${foods.length} foods, ${nutrients.length} nutrient rows`
  );

  // 2. Build lookup maps
  const categoryMap = {};
  for (const cat of categories) {
    categoryMap[cat.id] = cat.name;
  }

  const nutrientMap = {};
  for (const nut of nutrients) {
    nutrientMap[nut.foodId] = nut;
  }

  // 3. First, delete any existing TACO foods to make script idempotent
  console.log('🗑️  Removing existing TACO foods (if any)...');
  await client.execute("DELETE FROM foods WHERE source = 'TACO'");

  // 4. Build insert statements
  console.log('🌱 Inserting TACO foods...');
  let inserted = 0;
  let skipped = 0;

  // Process in batches of 50 for efficiency
  const BATCH_SIZE = 50;
  const batches = [];
  let currentBatch = [];

  for (const food of foods) {
    const nut = nutrientMap[food.id];
    if (!nut) {
      console.warn(`  ⚠️  No nutrients for food #${food.id}: ${food.name}`);
      skipped++;
      continue;
    }

    const calories = toInt(nut.kcal);
    const protein = toIntX100(nut.protein);
    const carbs = toIntX100(nut.carbohydrates);
    const fat = toIntX100(nut.lipids);

    // Skip foods with no caloric data at all
    if (calories === null && protein === null && carbs === null && fat === null) {
      console.warn(`  ⚠️  No macro data for food #${food.id}: ${food.name}`);
      skipped++;
      continue;
    }

    const categoryName = categoryMap[food.categoryId] || 'Outros';

    currentBatch.push({
      id: randomUUID(),
      name: food.name,
      calories: calories ?? 0,
      protein: protein ?? 0,
      carbs: carbs ?? 0,
      fat: fat ?? 0,
      category: categoryName,
      source: 'TACO',
    });

    if (currentBatch.length >= BATCH_SIZE) {
      batches.push(currentBatch);
      currentBatch = [];
    }
  }

  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }

  for (let b = 0; b < batches.length; b++) {
    const batch = batches[b];
    const stmts = batch.map((f) => ({
      sql: `INSERT INTO foods (id, trainer_id, name, calories, protein, carbs, fat, base_unit, base_amount, category, source, created_at)
            VALUES (?, NULL, ?, ?, ?, ?, ?, 'g', 100, ?, 'TACO', strftime('%s', 'now'))`,
      args: [f.id, f.name, f.calories, f.protein, f.carbs, f.fat, f.category],
    }));

    await client.batch(stmts, 'write');
    inserted += batch.length;
    process.stdout.write(
      `  📦 Batch ${b + 1}/${batches.length} — ${inserted} foods inserted\r`
    );
  }

  console.log(`\n✅ Done! Inserted ${inserted} TACO foods. Skipped ${skipped}.`);

  // 5. Quick verification
  const count = await client.execute(
    "SELECT COUNT(*) as cnt FROM foods WHERE source = 'TACO'"
  );
  console.log(`📊 Verification: ${count.rows[0].cnt} TACO foods in database.`);

  // Show a few samples
  const samples = await client.execute(
    "SELECT name, calories, protein, carbs, fat, category FROM foods WHERE source = 'TACO' LIMIT 5"
  );
  console.log('\n📋 Sample foods:');
  for (const row of samples.rows) {
    console.log(
      `  • ${row.name} — ${row.calories} kcal | P:${(row.protein / 100).toFixed(1)}g C:${(row.carbs / 100).toFixed(1)}g F:${(row.fat / 100).toFixed(1)}g [${row.category}]`
    );
  }
}

main().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
