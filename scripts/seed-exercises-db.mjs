/**
 * Seed script: Import exercises from Free Exercise DB (yuhonas)
 * into the `exercises` table in Turso production database.
 *
 * Data source: https://github.com/yuhonas/free-exercise-db
 * License: Unlicense (Public Domain)
 *
 * Maps English primaryMuscles → Portuguese muscle groups used by the app:
 *   Peito, Costas, Pernas, Ombros, Bíceps, Tríceps, Core, Glúteos, Cardio, Outros
 *
 * Stores extra metadata (equipment, level, force, secondary muscles, images)
 * in the `description` field as structured text so it's searchable and visible.
 *
 * Usage:
 *   node scripts/seed-exercises-db.mjs
 *
 * Requires env vars: TURSO_DATABASE_URL, TURSO_AUTH_TOKEN
 */

import { createClient } from '@libsql/client';
import { randomUUID } from 'crypto';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ─── Load .env.local ───────────────────────────────────────────────────────────
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
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
} catch { /* no .env.local */ }

// ─── Constants ─────────────────────────────────────────────────────────────────
const EXERCISES_JSON_URL =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';

const IMAGE_BASE_URL =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';

// Map English muscle names → Portuguese muscle group (matching app categories)
const MUSCLE_GROUP_MAP = {
  // Peito
  'chest': 'Peito',

  // Costas
  'lats': 'Costas',
  'middle back': 'Costas',
  'lower back': 'Costas',
  'traps': 'Costas',

  // Pernas
  'quadriceps': 'Pernas',
  'hamstrings': 'Pernas',
  'calves': 'Pernas',
  'adductors': 'Pernas',
  'abductors': 'Pernas',

  // Ombros
  'shoulders': 'Ombros',
  'neck': 'Ombros',

  // Bíceps
  'biceps': 'Bíceps',
  'forearms': 'Bíceps',

  // Tríceps
  'triceps': 'Tríceps',

  // Core / Abdômen
  'abdominals': 'Core',

  // Glúteos
  'glutes': 'Glúteos',
};

// Map English equipment → Portuguese
const EQUIPMENT_MAP = {
  'barbell': 'Barra',
  'dumbbell': 'Halter',
  'cable': 'Cabo/Polia',
  'machine': 'Máquina',
  'body only': 'Peso Corporal',
  'bands': 'Elástico/Banda',
  'kettlebells': 'Kettlebell',
  'medicine ball': 'Bola Medicinal',
  'exercise ball': 'Bola Suíça',
  'foam roll': 'Rolo de Espuma',
  'e-z curl bar': 'Barra W',
  'other': 'Outro',
};

// Map English level → Portuguese
const LEVEL_MAP = {
  'beginner': 'Iniciante',
  'intermediate': 'Intermediário',
  'expert': 'Avançado',
};

// Map English category → Portuguese
const CATEGORY_MAP = {
  'strength': 'Força',
  'stretching': 'Alongamento',
  'plyometrics': 'Pliometria',
  'strongman': 'Strongman',
  'powerlifting': 'Powerlifting',
  'cardio': 'Cardio',
  'olympic weightlifting': 'Levantamento Olímpico',
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
function getMuscleGroup(primaryMuscles) {
  if (!primaryMuscles || primaryMuscles.length === 0) return 'Outros';
  const first = primaryMuscles[0].toLowerCase();
  return MUSCLE_GROUP_MAP[first] || 'Outros';
}

function buildDescription(exercise) {
  const parts = [];

  // Category / type
  if (exercise.category) {
    parts.push(`Tipo: ${CATEGORY_MAP[exercise.category] || exercise.category}`);
  }

  // Level
  if (exercise.level) {
    parts.push(`Nível: ${LEVEL_MAP[exercise.level] || exercise.level}`);
  }

  // Equipment
  if (exercise.equipment) {
    parts.push(`Equipamento: ${EQUIPMENT_MAP[exercise.equipment] || exercise.equipment}`);
  }

  // Force
  if (exercise.force) {
    const forceMap = { pull: 'Puxar', push: 'Empurrar', static: 'Estático' };
    parts.push(`Força: ${forceMap[exercise.force] || exercise.force}`);
  }

  // Mechanic
  if (exercise.mechanic) {
    const mechMap = { compound: 'Composto', isolation: 'Isolado' };
    parts.push(`Mecânica: ${mechMap[exercise.mechanic] || exercise.mechanic}`);
  }

  // Primary muscles (in Portuguese)
  if (exercise.primaryMuscles?.length > 0) {
    const mapped = exercise.primaryMuscles.map(m => MUSCLE_GROUP_MAP[m.toLowerCase()] || m);
    parts.push(`Músculos principais: ${[...new Set(mapped)].join(', ')}`);
  }

  // Secondary muscles (in Portuguese)
  if (exercise.secondaryMuscles?.length > 0) {
    const mapped = exercise.secondaryMuscles.map(m => MUSCLE_GROUP_MAP[m.toLowerCase()] || m);
    parts.push(`Músculos secundários: ${[...new Set(mapped)].join(', ')}`);
  }

  // Instructions (join all steps)
  if (exercise.instructions?.length > 0) {
    parts.push(''); // blank line
    parts.push('Instruções:');
    exercise.instructions.forEach((step, i) => {
      parts.push(`${i + 1}. ${step}`);
    });
  }

  return parts.join('\n');
}

function buildVideoUrl(exercise) {
  // Use first image as a reference URL (GitHub-hosted)
  if (exercise.images?.length > 0) {
    return `${IMAGE_BASE_URL}${exercise.images[0]}`;
  }
  return null;
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

  // 1. Fetch exercises from GitHub
  console.log('📥 Fetching Free Exercise DB from GitHub...');
  const response = await fetch(EXERCISES_JSON_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch exercises: ${response.status}`);
  }
  const exercisesData = await response.json();
  console.log(`  ✅ ${exercisesData.length} exercises fetched`);

  // 2. Delete existing system exercises (idempotent)
  console.log('🗑️  Removing existing system exercises (trainerId IS NULL)...');
  await client.execute("DELETE FROM exercises WHERE trainer_id IS NULL");

  // 3. Insert in batches
  console.log('🌱 Inserting exercises...');
  let inserted = 0;
  const BATCH_SIZE = 50;
  const batches = [];
  let currentBatch = [];

  for (const ex of exercisesData) {
    const muscleGroup = getMuscleGroup(ex.primaryMuscles);
    const description = buildDescription(ex);
    const videoUrl = buildVideoUrl(ex);

    currentBatch.push({
      id: randomUUID(),
      name: ex.name,
      muscleGroup,
      videoUrl,
      description,
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
    const stmts = batch.map((ex) => ({
      sql: `INSERT INTO exercises (id, trainer_id, name, muscle_group, video_url, description, created_at, updated_at)
            VALUES (?, NULL, ?, ?, ?, ?, strftime('%s', 'now'), strftime('%s', 'now'))`,
      args: [ex.id, ex.name, ex.muscleGroup, ex.videoUrl, ex.description],
    }));

    await client.batch(stmts, 'write');
    inserted += batch.length;
    process.stdout.write(
      `  📦 Batch ${b + 1}/${batches.length} — ${inserted} exercises inserted\r`
    );
  }

  console.log(`\n✅ Done! Inserted ${inserted} exercises.`);

  // 4. Verification
  const countResult = await client.execute(
    "SELECT COUNT(*) as cnt FROM exercises WHERE trainer_id IS NULL"
  );
  console.log(`📊 Verification: ${countResult.rows[0].cnt} system exercises in database.`);

  // Show distribution by muscle group
  const distribution = await client.execute(
    "SELECT muscle_group, COUNT(*) as cnt FROM exercises WHERE trainer_id IS NULL GROUP BY muscle_group ORDER BY cnt DESC"
  );
  console.log('\n📋 Distribution by muscle group:');
  for (const row of distribution.rows) {
    console.log(`  • ${row.muscle_group}: ${row.cnt} exercises`);
  }

  // Show a few samples
  const samples = await client.execute(
    "SELECT name, muscle_group, video_url FROM exercises WHERE trainer_id IS NULL LIMIT 5"
  );
  console.log('\n🏋️ Sample exercises:');
  for (const row of samples.rows) {
    console.log(`  • ${row.name} [${row.muscle_group}]`);
  }
}

main().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
