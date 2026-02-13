import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error('Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN');
  process.exit(1);
}

console.log(`Connecting to: ${url}`);
const client = createClient({ url, authToken });

/**
 * Instead of running the incremental migrations (which have INSERT FROM old table / DROP logic  
 * that fails on an empty DB), we create the FINAL schema directly.
 * This matches drizzle-kit push behavior: apply the current schema state.
 */
const statements = [
  // 1. trainers
  `CREATE TABLE IF NOT EXISTS \`trainers\` (
    \`id\` text PRIMARY KEY NOT NULL,
    \`name\` text NOT NULL,
    \`email\` text NOT NULL,
    \`created_at\` integer DEFAULT (strftime('%s', 'now')),
    \`updated_at\` integer DEFAULT (strftime('%s', 'now'))
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS \`trainers_email_unique\` ON \`trainers\` (\`email\`)`,

  // 2. plans
  `CREATE TABLE IF NOT EXISTS \`plans\` (
    \`id\` text PRIMARY KEY NOT NULL,
    \`trainer_id\` text NOT NULL,
    \`name\` text NOT NULL,
    \`price\` integer NOT NULL,
    \`duration_months\` integer NOT NULL,
    \`active\` integer DEFAULT true,
    \`created_at\` integer DEFAULT (strftime('%s', 'now')),
    \`updated_at\` integer DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (\`trainer_id\`) REFERENCES \`trainers\`(\`id\`) ON UPDATE no action ON DELETE no action
  )`,

  // 3. students (final version with all columns from all migrations)
  `CREATE TABLE IF NOT EXISTS \`students\` (
    \`id\` text PRIMARY KEY NOT NULL,
    \`trainer_id\` text NOT NULL,
    \`name\` text NOT NULL,
    \`email\` text,
    \`cpf\` text,
    \`phone\` text,
    \`photo_url\` text,
    \`plan_id\` text REFERENCES plans(id),
    \`active\` integer DEFAULT true,
    \`plan_end\` integer,
    \`xp\` integer DEFAULT 0,
    \`access_types\` text,
    \`invite_token\` text,
    \`level\` integer DEFAULT 1,
    \`current_xp\` integer DEFAULT 0,
    \`current_streak\` integer DEFAULT 0,
    \`longest_streak\` integer DEFAULT 0,
    \`last_activity_date\` integer,
    \`created_at\` integer DEFAULT (strftime('%s', 'now')),
    \`updated_at\` integer DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (\`trainer_id\`) REFERENCES \`trainers\`(\`id\`) ON UPDATE no action ON DELETE no action
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS \`students_invite_token_unique\` ON \`students\` (\`invite_token\`)`,

  // 4. exercises (final version - trainer_id nullable from migration 0002)
  `CREATE TABLE IF NOT EXISTS \`exercises\` (
    \`id\` text PRIMARY KEY NOT NULL,
    \`trainer_id\` text,
    \`name\` text NOT NULL,
    \`muscle_group\` text NOT NULL,
    \`video_url\` text,
    \`description\` text,
    \`created_at\` integer DEFAULT (strftime('%s', 'now')),
    \`updated_at\` integer DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (\`trainer_id\`) REFERENCES \`trainers\`(\`id\`) ON UPDATE no action ON DELETE no action
  )`,

  // 5. workout_plans
  `CREATE TABLE IF NOT EXISTS \`workout_plans\` (
    \`id\` text PRIMARY KEY NOT NULL,
    \`trainer_id\` text NOT NULL,
    \`student_id\` text,
    \`name\` text NOT NULL,
    \`is_template\` integer DEFAULT false,
    \`active\` integer DEFAULT true,
    \`cardio\` text,
    \`observations\` text,
    \`created_at\` integer DEFAULT (strftime('%s', 'now')),
    \`updated_at\` integer DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (\`trainer_id\`) REFERENCES \`trainers\`(\`id\`) ON UPDATE no action ON DELETE no action,
    FOREIGN KEY (\`student_id\`) REFERENCES \`students\`(\`id\`) ON UPDATE no action ON DELETE no action
  )`,

  // 6. workouts (final version from migration 0002 - with plan_id)
  `CREATE TABLE IF NOT EXISTS \`workouts\` (
    \`id\` text PRIMARY KEY NOT NULL,
    \`trainer_id\` text NOT NULL,
    \`student_id\` text,
    \`plan_id\` text,
    \`title\` text NOT NULL,
    \`status\` text DEFAULT 'pending',
    \`scheduled_date\` integer,
    \`completed_at\` integer,
    \`created_at\` integer DEFAULT (strftime('%s', 'now')),
    \`updated_at\` integer DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (\`trainer_id\`) REFERENCES \`trainers\`(\`id\`) ON UPDATE no action ON DELETE no action,
    FOREIGN KEY (\`student_id\`) REFERENCES \`students\`(\`id\`) ON UPDATE no action ON DELETE no action,
    FOREIGN KEY (\`plan_id\`) REFERENCES \`workout_plans\`(\`id\`) ON UPDATE no action ON DELETE cascade
  )`,

  // 7. workout_items (final version with extra columns from migration 0002)
  `CREATE TABLE IF NOT EXISTS \`workout_items\` (
    \`id\` text PRIMARY KEY NOT NULL,
    \`workout_id\` text NOT NULL,
    \`exercise_id\` text NOT NULL,
    \`sets\` integer NOT NULL,
    \`reps\` text NOT NULL,
    \`rpe\` integer,
    \`rest_seconds\` integer,
    \`notes\` text,
    \`order\` integer NOT NULL,
    \`warmup_sets\` integer DEFAULT 0,
    \`preparatory_sets\` integer DEFAULT 0,
    \`is_superset\` integer DEFAULT false,
    \`advanced_techniques\` text,
    FOREIGN KEY (\`workout_id\`) REFERENCES \`workouts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY (\`exercise_id\`) REFERENCES \`exercises\`(\`id\`) ON UPDATE no action ON DELETE no action
  )`,

  // 8. payments
  `CREATE TABLE IF NOT EXISTS \`payments\` (
    \`id\` text PRIMARY KEY NOT NULL,
    \`trainer_id\` text NOT NULL,
    \`student_id\` text NOT NULL,
    \`plan_id\` text,
    \`amount\` integer NOT NULL,
    \`due_date\` integer NOT NULL,
    \`paid_at\` integer,
    \`status\` text DEFAULT 'pending',
    \`method\` text,
    \`notes\` text,
    \`created_at\` integer DEFAULT (strftime('%s', 'now')),
    \`updated_at\` integer DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (\`trainer_id\`) REFERENCES \`trainers\`(\`id\`) ON UPDATE no action ON DELETE no action,
    FOREIGN KEY (\`student_id\`) REFERENCES \`students\`(\`id\`) ON UPDATE no action ON DELETE no action,
    FOREIGN KEY (\`plan_id\`) REFERENCES \`plans\`(\`id\`) ON UPDATE no action ON DELETE no action
  )`,

  // 9. assessments
  `CREATE TABLE IF NOT EXISTS \`assessments\` (
    \`id\` text PRIMARY KEY NOT NULL,
    \`trainer_id\` text NOT NULL,
    \`student_id\` text NOT NULL,
    \`date\` integer NOT NULL,
    \`method\` text NOT NULL,
    \`weight\` integer NOT NULL,
    \`height\` integer NOT NULL,
    \`triceps\` integer,
    \`subscapular\` integer,
    \`chest\` integer,
    \`axillary\` integer,
    \`suprailiac\` integer,
    \`abdominal\` integer,
    \`thigh\` integer,
    \`bio_body_fat\` integer,
    \`bio_lean_mass\` integer,
    \`neck\` integer,
    \`shoulder\` integer,
    \`chest_circumference\` integer,
    \`waist\` integer,
    \`abdomen\` integer,
    \`hips\` integer,
    \`arm_right\` integer,
    \`arm_left\` integer,
    \`forearm_right\` integer,
    \`forearm_left\` integer,
    \`thigh_right\` integer,
    \`thigh_left\` integer,
    \`calf_right\` integer,
    \`calf_left\` integer,
    \`body_fat\` integer,
    \`lean_mass\` integer,
    \`fat_mass\` integer,
    \`bmi\` integer,
    \`bmr\` integer,
    \`density\` integer,
    \`observations\` text,
    \`created_at\` integer DEFAULT (strftime('%s', 'now')),
    \`updated_at\` integer DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (\`trainer_id\`) REFERENCES \`trainers\`(\`id\`) ON UPDATE no action ON DELETE no action,
    FOREIGN KEY (\`student_id\`) REFERENCES \`students\`(\`id\`) ON UPDATE no action ON DELETE no action
  )`,

  // 10. assessment_photos
  `CREATE TABLE IF NOT EXISTS \`assessment_photos\` (
    \`id\` text PRIMARY KEY NOT NULL,
    \`assessment_id\` text NOT NULL,
    \`type\` text NOT NULL,
    \`photo_url\` text NOT NULL,
    \`created_at\` integer DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (\`assessment_id\`) REFERENCES \`assessments\`(\`id\`) ON UPDATE no action ON DELETE cascade
  )`,

  // 11. badges
  `CREATE TABLE IF NOT EXISTS \`badges\` (
    \`id\` text PRIMARY KEY NOT NULL,
    \`name\` text NOT NULL,
    \`description\` text NOT NULL,
    \`icon\` text NOT NULL,
    \`xp_required\` integer NOT NULL,
    \`color\` text NOT NULL,
    \`created_at\` integer DEFAULT (strftime('%s', 'now'))
  )`,

  // 12. student_badges
  `CREATE TABLE IF NOT EXISTS \`student_badges\` (
    \`id\` text PRIMARY KEY NOT NULL,
    \`student_id\` text NOT NULL,
    \`badge_id\` text NOT NULL,
    \`earned_at\` integer DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (\`student_id\`) REFERENCES \`students\`(\`id\`) ON UPDATE no action ON DELETE no action,
    FOREIGN KEY (\`badge_id\`) REFERENCES \`badges\`(\`id\`) ON UPDATE no action ON DELETE no action
  )`,

  // 13. gamification_logs
  `CREATE TABLE IF NOT EXISTS \`gamification_logs\` (
    \`id\` text PRIMARY KEY NOT NULL,
    \`student_id\` text NOT NULL,
    \`action\` text NOT NULL,
    \`xp_earned\` integer NOT NULL,
    \`created_at\` integer DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (\`student_id\`) REFERENCES \`students\`(\`id\`) ON UPDATE no action ON DELETE cascade
  )`,

  // 14. leads
  `CREATE TABLE IF NOT EXISTS \`leads\` (
    \`id\` text PRIMARY KEY NOT NULL,
    \`trainer_id\` text NOT NULL,
    \`name\` text NOT NULL,
    \`phone\` text,
    \`social_handle\` text,
    \`photo_url\` text,
    \`pipeline_stage\` text DEFAULT 'new',
    \`estimated_value\` integer DEFAULT 0,
    \`temperature\` text DEFAULT 'warm',
    \`stage_data\` text,
    \`last_contact_at\` integer,
    \`status\` text DEFAULT 'new',
    \`created_at\` integer DEFAULT (strftime('%s', 'now')),
    \`updated_at\` integer DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (\`trainer_id\`) REFERENCES \`trainers\`(\`id\`) ON UPDATE no action ON DELETE no action
  )`,

  // 15. nutritional_plans
  `CREATE TABLE IF NOT EXISTS \`nutritional_plans\` (
    \`id\` text PRIMARY KEY NOT NULL,
    \`trainer_id\` text NOT NULL,
    \`student_id\` text NOT NULL,
    \`title\` text NOT NULL,
    \`daily_kcal\` integer NOT NULL,
    \`protein_g\` integer NOT NULL,
    \`carbs_g\` integer NOT NULL,
    \`fat_g\` integer NOT NULL,
    \`active\` integer DEFAULT true,
    \`created_at\` integer DEFAULT (strftime('%s', 'now')),
    \`updated_at\` integer DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (\`trainer_id\`) REFERENCES \`trainers\`(\`id\`) ON UPDATE no action ON DELETE no action,
    FOREIGN KEY (\`student_id\`) REFERENCES \`students\`(\`id\`) ON UPDATE no action ON DELETE no action
  )`,

  // 16. meals
  `CREATE TABLE IF NOT EXISTS \`meals\` (
    \`id\` text PRIMARY KEY NOT NULL,
    \`plan_id\` text NOT NULL,
    \`name\` text NOT NULL,
    \`time\` text,
    \`order\` integer NOT NULL,
    FOREIGN KEY (\`plan_id\`) REFERENCES \`nutritional_plans\`(\`id\`) ON UPDATE no action ON DELETE cascade
  )`,

  // 17. meal_items
  `CREATE TABLE IF NOT EXISTS \`meal_items\` (
    \`id\` text PRIMARY KEY NOT NULL,
    \`meal_id\` text NOT NULL,
    \`food_name\` text NOT NULL,
    \`portion\` text NOT NULL,
    \`calories\` integer,
    \`protein\` integer,
    \`carbs\` integer,
    \`fat\` integer,
    FOREIGN KEY (\`meal_id\`) REFERENCES \`meals\`(\`id\`) ON UPDATE no action ON DELETE cascade
  )`,

  // 18. meal_logs
  `CREATE TABLE IF NOT EXISTS \`meal_logs\` (
    \`id\` text PRIMARY KEY NOT NULL,
    \`student_id\` text NOT NULL,
    \`meal_id\` text,
    \`name\` text,
    \`calories\` integer,
    \`is_cheat_meal\` integer DEFAULT false,
    \`eaten_at\` integer DEFAULT (strftime('%s', 'now')),
    \`skipped\` integer DEFAULT false,
    FOREIGN KEY (\`student_id\`) REFERENCES \`students\`(\`id\`) ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY (\`meal_id\`) REFERENCES \`meals\`(\`id\`) ON UPDATE no action ON DELETE no action
  )`,

  // 19. hydration_logs
  `CREATE TABLE IF NOT EXISTS \`hydration_logs\` (
    \`id\` text PRIMARY KEY NOT NULL,
    \`student_id\` text NOT NULL,
    \`date\` integer NOT NULL,
    \`amount_ml\` integer NOT NULL,
    \`created_at\` integer DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (\`student_id\`) REFERENCES \`students\`(\`id\`) ON UPDATE no action ON DELETE cascade
  )`,

  // 20. mood_logs
  `CREATE TABLE IF NOT EXISTS \`mood_logs\` (
    \`id\` text PRIMARY KEY NOT NULL,
    \`student_id\` text NOT NULL,
    \`mood\` text NOT NULL,
    \`note\` text,
    \`created_at\` integer DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (\`student_id\`) REFERENCES \`students\`(\`id\`) ON UPDATE no action ON DELETE cascade
  )`,

  // 21. workout_logs
  `CREATE TABLE IF NOT EXISTS \`workout_logs\` (
    \`id\` text PRIMARY KEY NOT NULL,
    \`student_id\` text NOT NULL,
    \`workout_id\` text NOT NULL,
    \`started_at\` integer NOT NULL,
    \`ended_at\` integer,
    \`status\` text DEFAULT 'in_progress',
    \`notes\` text,
    \`created_at\` integer DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (\`student_id\`) REFERENCES \`students\`(\`id\`) ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY (\`workout_id\`) REFERENCES \`workouts\`(\`id\`) ON UPDATE no action ON DELETE no action
  )`,

  // 22. workout_log_sets
  `CREATE TABLE IF NOT EXISTS \`workout_log_sets\` (
    \`id\` text PRIMARY KEY NOT NULL,
    \`log_id\` text NOT NULL,
    \`exercise_id\` text NOT NULL,
    \`set_number\` integer NOT NULL,
    \`weight\` integer,
    \`reps\` integer NOT NULL,
    \`rpe\` integer,
    \`completed\` integer DEFAULT true,
    \`created_at\` integer DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (\`log_id\`) REFERENCES \`workout_logs\`(\`id\`) ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY (\`exercise_id\`) REFERENCES \`exercises\`(\`id\`) ON UPDATE no action ON DELETE no action
  )`,
];

async function run() {
  // Check existing tables
  const existing = await client.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
  console.log('Existing tables:', existing.rows.map(r => r.name));

  if (existing.rows.length > 0) {
    console.log('\nDatabase already has tables. Aborting to prevent conflicts.');
    console.log('If you want to recreate, drop all tables first.');
    client.close();
    return;
  }

  console.log('\nCreating schema...');
  for (let i = 0; i < statements.length; i++) {
    try {
      await client.execute(statements[i]);
      console.log(`  [${i + 1}/${statements.length}] OK`);
    } catch (err) {
      console.error(`  [${i + 1}/${statements.length}] ERROR: ${err.message}`);
      throw err;
    }
  }

  // Verify
  const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
  console.log('\n=== Tables created ===');
  tables.rows.forEach(r => console.log(`  - ${r.name}`));
  console.log(`\nTotal: ${tables.rows.length} tables`);
  
  client.close();
  console.log('Done!');
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
