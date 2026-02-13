// Compare schema.ts columns vs actual Turso columns for ALL tables
const { createClient } = require('@libsql/client');

const c = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Expected columns per table based on schema.ts
const expected = {
  trainers: ['id', 'name', 'email', 'created_at', 'updated_at'],
  plans: ['id', 'trainer_id', 'name', 'price', 'duration_months', 'active', 'created_at', 'updated_at'],
  payments: ['id', 'trainer_id', 'student_id', 'plan_id', 'amount', 'due_date', 'paid_at', 'status', 'method', 'notes', 'created_at', 'updated_at'],
  students: ['id', 'trainer_id', 'name', 'email', 'cpf', 'phone', 'photo_url', 'plan_id', 'plan_end', 'xp', 'active', 'access_types', 'invite_token', 'birth_date', 'gender', 'height', 'weight', 'level', 'current_xp', 'current_streak', 'longest_streak', 'last_activity_date', 'created_at', 'updated_at'],
  leads: ['id', 'trainer_id', 'name', 'phone', 'social_handle', 'photo_url', 'pipeline_stage', 'estimated_value', 'temperature', 'stage_data', 'last_contact_at', 'status', 'created_at', 'updated_at'],
  badges: ['id', 'name', 'description', 'icon', 'xp_required', 'color', 'created_at'],
  student_badges: ['id', 'student_id', 'badge_id', 'earned_at'],
  exercises: ['id', 'trainer_id', 'name', 'muscle_group', 'video_url', 'description', 'created_at', 'updated_at'],
  workout_plans: ['id', 'trainer_id', 'student_id', 'name', 'is_template', 'active', 'cardio', 'observations', 'created_at', 'updated_at'],
  workouts: ['id', 'trainer_id', 'student_id', 'plan_id', 'title', 'status', 'scheduled_date', 'completed_at', 'created_at', 'updated_at'],
  workout_items: ['id', 'workout_id', 'exercise_id', 'sets', 'reps', 'rpe', 'rest_seconds', 'notes', 'order', 'warmup_sets', 'preparatory_sets', 'is_superset', 'advanced_techniques'],
  foods: ['id', 'trainer_id', 'name', 'calories', 'protein', 'carbs', 'fat', 'base_unit', 'base_amount', 'category', 'source', 'created_at'],
  nutritional_plans: ['id', 'trainer_id', 'student_id', 'title', 'daily_kcal', 'protein_g', 'carbs_g', 'fat_g', 'active', 'created_at', 'updated_at'],
  meals: ['id', 'plan_id', 'name', 'time', 'order'],
  meal_items: ['id', 'meal_id', 'food_id', 'food_name', 'portion', 'unit', 'calories', 'protein', 'carbs', 'fat'],
  assessments: ['id', 'trainer_id', 'student_id', 'date', 'method', 'weight', 'height', 'triceps', 'subscapular', 'chest', 'axillary', 'suprailiac', 'abdominal', 'thigh', 'bio_body_fat', 'bio_lean_mass', 'neck', 'shoulder', 'chest_circumference', 'waist', 'abdomen', 'hips', 'arm_right', 'arm_left', 'forearm_right', 'forearm_left', 'thigh_right', 'thigh_left', 'calf_right', 'calf_left', 'body_fat', 'lean_mass', 'fat_mass', 'bmi', 'bmr', 'density', 'observations', 'created_at', 'updated_at'],
  assessment_photos: ['id', 'assessment_id', 'type', 'photo_url', 'created_at'],
  hydration_logs: ['id', 'student_id', 'date', 'amount_ml', 'created_at'],
  meal_logs: ['id', 'student_id', 'meal_id', 'name', 'calories', 'is_cheat_meal', 'eaten_at', 'skipped'],
  gamification_logs: ['id', 'student_id', 'action', 'xp_earned', 'created_at'],
  mood_logs: ['id', 'student_id', 'mood', 'note', 'created_at'],
  workout_logs: ['id', 'student_id', 'workout_id', 'started_at', 'ended_at', 'status', 'notes', 'created_at'],
  workout_log_sets: ['id', 'log_id', 'exercise_id', 'set_number', 'weight', 'reps', 'rpe', 'completed', 'created_at'],
  forms: ['id', 'trainer_id', 'title', 'description', 'type', 'trigger_type', 'is_active', 'created_at', 'updated_at'],
  form_questions: ['id', 'form_id', 'order', 'type', 'question', 'description', 'options', 'required', 'created_at'],
  student_forms: ['id', 'student_id', 'form_id', 'status', 'assigned_at', 'completed_at'],
  form_answers: ['id', 'response_id', 'question_id', 'answer', 'created_at'],
};

async function main() {
  let issues = 0;
  
  for (const [table, expectedCols] of Object.entries(expected)) {
    try {
      const result = await c.execute(`PRAGMA table_info(${table})`);
      const actualCols = result.rows.map(r => r.name);
      
      const missing = expectedCols.filter(col => !actualCols.includes(col));
      const extra = actualCols.filter(col => !expectedCols.includes(col));
      
      if (missing.length > 0 || extra.length > 0) {
        console.log(`\n❌ ${table}:`);
        if (missing.length) console.log(`   MISSING: ${missing.join(', ')}`);
        if (extra.length) console.log(`   EXTRA: ${extra.join(', ')}`);
        issues++;
      } else {
        console.log(`✅ ${table} (${actualCols.length} cols)`);
      }
    } catch (e) {
      console.log(`❌ ${table}: ${e.message}`);
      issues++;
    }
  }
  
  console.log(`\n=== ${issues} tables with issues ===`);
  c.close();
}

main().catch(e => { console.error(e); process.exit(1); });
