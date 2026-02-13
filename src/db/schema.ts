import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Trainers (Multi-tenant owners)
export const trainers = sqliteTable('trainers', {
    id: text('id').primaryKey(), // Clerk ID
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

// Plans (Subscriptions)
export const plans = sqliteTable('plans', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    trainerId: text('trainer_id').notNull().references(() => trainers.id),
    name: text('name').notNull(), // e.g., "Mensal", "Trimestral"
    price: integer('price').notNull(), // in cents (R$ 100,00 = 10000)
    durationMonths: integer('duration_months').notNull(),
    active: integer('active', { mode: 'boolean' }).default(true),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

// Payments (Financial Records)
export const payments = sqliteTable('payments', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    trainerId: text('trainer_id').notNull().references(() => trainers.id),
    studentId: text('student_id').notNull().references(() => students.id),
    planId: text('plan_id').references(() => plans.id), // Optional link to specific plan context
    amount: integer('amount').notNull(), // in cents
    dueDate: integer('due_date', { mode: 'timestamp' }).notNull(),
    paidAt: integer('paid_at', { mode: 'timestamp' }),
    status: text('status').default('pending'), // pending, paid, overdue
    method: text('method'), // pix, credit_card, cash, etc.
    notes: text('notes'),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

// Students (Managed by Trainers)
export const students = sqliteTable('students', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    trainerId: text('trainer_id').notNull().references(() => trainers.id),
    name: text('name').notNull(),
    email: text('email'),
    cpf: text('cpf'),
    phone: text('phone'),
    photoUrl: text('photo_url'),
    planId: text('plan_id').references(() => plans.id),
    planEnd: integer('plan_end', { mode: 'timestamp' }),
    xp: integer('xp').default(0), // Gamification: Experience Points
    active: integer('active', { mode: 'boolean' }).default(true),
    accessTypes: text('access_types', { mode: 'json' }).$type<string[]>(), // ['workout', 'nutrition']
    inviteToken: text('invite_token').unique(), // For conversion flow

    // Demographics for Calculations
    birthDate: integer('birth_date', { mode: 'timestamp' }),
    gender: text('gender'), // 'male' | 'female'
    height: integer('height'), // in cm
    weight: integer('weight'), // in grams

    // Gamification & Engagement
    level: integer('level').default(1),
    currentXp: integer('current_xp').default(0),
    currentStreak: integer('current_streak').default(0),
    longestStreak: integer('longest_streak').default(0),
    lastActivityDate: integer('last_activity_date', { mode: 'timestamp' }),

    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

// Leads (Prospects)
export const leads = sqliteTable('leads', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    trainerId: text('trainer_id').notNull().references(() => trainers.id),
    name: text('name').notNull(),
    phone: text('phone'),
    socialHandle: text('social_handle'),
    photoUrl: text('photo_url'), // Instagram Profile Pic URL
    // Pipeline Fields
    pipelineStage: text('pipeline_stage').default('new'), // new, contacted, scheduled, negotiation, won, lost
    estimatedValue: integer('estimated_value').default(0),
    temperature: text('temperature').default('warm'), // cold, warm, hot
    stageData: text('stage_data', { mode: 'json' }).$type<Record<string, any>>(), // Dynamic fields per stage
    lastContactAt: integer('last_contact_at', { mode: 'timestamp' }),

    status: text('status').default('new'), // Deprecated/Legacy, kept for backward compatibility if needed, or alias to stage
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

// Badges (Gamification)
export const badges = sqliteTable('badges', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    description: text('description').notNull(),
    icon: text('icon').notNull(), // Emoji or icon identifier
    xpRequired: integer('xp_required').notNull(),
    color: text('color').notNull(), // Badge color theme
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

// Student Badges (Join table)
export const studentBadges = sqliteTable('student_badges', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    studentId: text('student_id').notNull().references(() => students.id),
    badgeId: text('badge_id').notNull().references(() => badges.id),
    earnedAt: integer('earned_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

// Exercises (Library)
export const exercises = sqliteTable('exercises', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    trainerId: text('trainer_id').references(() => trainers.id),
    name: text('name').notNull(),
    muscleGroup: text('muscle_group').notNull(), // e.g., 'Chest', 'Back', 'Legs'
    videoUrl: text('video_url'),
    description: text('description'),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

// Workout Plans (Fichas de Treino)
export const workoutPlans = sqliteTable('workout_plans', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    trainerId: text('trainer_id').notNull().references(() => trainers.id),
    studentId: text('student_id').references(() => students.id), // Nullable for templates
    name: text('name').notNull(), // e.g., "Hipertrofia - Fase 1"
    isTemplate: integer('is_template', { mode: 'boolean' }).default(false),
    active: integer('active', { mode: 'boolean' }).default(true),

    // Cardio Settings
    cardio: text('cardio', { mode: 'json' }).$type<{
        frequency: 'weekly' | 'daily';
        type: 'time' | 'distance'; // Keeping flexible, though UI shows time units
        duration: number;
        unit: 'minutes' | 'hours' | 'km';
        days?: string[]; // ['segunda', 'terca'...]
        notes?: string;
    }>(),

    observations: text('observations'), // General notes for the whole sheet

    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

// Workouts (Prescriptions - Now linked to a Plan/Ficha)
export const workouts = sqliteTable('workouts', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    trainerId: text('trainer_id').notNull().references(() => trainers.id),
    studentId: text('student_id').references(() => students.id), // Nullable for templates
    planId: text('plan_id').references(() => workoutPlans.id, { onDelete: 'cascade' }), // Optional for backward compatibility, but ideally required for new logic
    title: text('title').notNull(), // e.g., "Treino A - Peito"
    status: text('status').default('pending'), // pending, completed, skipped
    scheduledDate: integer('scheduled_date', { mode: 'timestamp' }),
    completedAt: integer('completed_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

// Workout Items (Join Table: Workout <-> Exercise)
export const workoutItems = sqliteTable('workout_items', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    workoutId: text('workout_id').notNull().references(() => workouts.id, { onDelete: 'cascade' }),
    exerciseId: text('exercise_id').notNull().references(() => exercises.id),
    sets: integer('sets').notNull(),
    warmupSets: integer('warmup_sets').default(0),
    preparatorySets: integer('preparatory_sets').default(0),
    reps: text('reps').notNull(), // text to allow ranges like "10-12"
    rpe: integer('rpe'), // Rate of Perceived Exertion (1-10)
    restSeconds: integer('rest_seconds'),
    isSuperset: integer('is_superset', { mode: 'boolean' }).default(false),
    advancedTechniques: text('advanced_techniques'), // JSON string: { type: string, notes: string }[]
    notes: text('notes'),
    order: integer('order').notNull(),
});

// --- Nutrition Module ---

// --- Nutrition Module ---

// Foods
export const foods = sqliteTable('foods', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    trainerId: text('trainer_id').references(() => trainers.id), // Owner of custom food
    name: text('name').notNull(),
    calories: integer('calories').notNull(), // per base_amount
    protein: integer('protein').notNull(), // g * 100
    carbs: integer('carbs').notNull(), // g * 100
    fat: integer('fat').notNull(), // g * 100
    baseUnit: text('base_unit').default('g'), // 'g' or 'ml'
    baseAmount: integer('base_amount').default(100), // usually 100g
    category: text('category'), // 'Proteínas', 'Cereais', etc.
    source: text('source').default('system'), // 'TACO', 'TBCA', 'System', 'User'
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

export const nutritionalPlans = sqliteTable('nutritional_plans', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    trainerId: text('trainer_id').notNull().references(() => trainers.id),
    studentId: text('student_id').references(() => students.id), // Nullable for templates
    title: text('title').notNull(), // e.g. "Cutting Phase 1"
    dailyKcal: integer('daily_kcal').notNull(),
    proteinG: integer('protein_g').notNull(),
    carbsG: integer('carbs_g').notNull(),
    fatG: integer('fat_g').notNull(),
    waterGoalMl: integer('water_goal_ml').default(2500),
    daysOfWeek: text('days_of_week', { mode: 'json' }).$type<string[]>(), // ['seg', 'ter', ...]
    isTemplate: integer('is_template', { mode: 'boolean' }).default(false),
    active: integer('active', { mode: 'boolean' }).default(true),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

export const meals = sqliteTable('meals', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    planId: text('plan_id').notNull().references(() => nutritionalPlans.id, { onDelete: 'cascade' }),
    name: text('name').notNull(), // e.g. "Café da Manhã"
    time: text('time'), // e.g. "08:00"
    order: integer('order').notNull(),
});

export const mealItems = sqliteTable('meal_items', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    mealId: text('meal_id').notNull().references(() => meals.id, { onDelete: 'cascade' }),
    foodId: text('food_id'), // Optional link to DB (FK removed for migration stability)
    foodName: text('food_name').notNull(), // Snapshot or custom name
    portion: integer('portion').notNull(), // Amount in baseUnit (e.g. 150g)
    unit: text('unit').default('g'), // 'g', 'ml', 'unidade'

    // Snapshot of calculated values for this portion
    calories: integer('calories'),
    protein: integer('protein'),
    carbs: integer('carbs'),
    fat: integer('fat'),
});

// --- Relations ---

import { relations } from 'drizzle-orm';

export const trainersRelations = relations(trainers, ({ many }) => ({
    students: many(students),
    plans: many(plans),
    payments: many(payments),
    exercises: many(exercises),
    workoutPlans: many(workoutPlans),
    workouts: many(workouts),
    nutritionalPlans: many(nutritionalPlans),
    foods: many(foods),
}));

export const plansRelations = relations(plans, ({ one, many }) => ({
    trainer: one(trainers, {
        fields: [plans.trainerId],
        references: [trainers.id],
    }),
    students: many(students),
    payments: many(payments),
}));

// Moved studentsRelations to end of file to fix TDZ with moodLogs/workoutLogs

export const paymentsRelations = relations(payments, ({ one }) => ({
    trainer: one(trainers, {
        fields: [payments.trainerId],
        references: [trainers.id],
    }),
    student: one(students, {
        fields: [payments.studentId],
        references: [students.id],
    }),
    plan: one(plans, {
        fields: [payments.planId],
        references: [plans.id],
    }),
}));

export const badgesRelations = relations(badges, ({ many }) => ({
    studentBadges: many(studentBadges),
}));

export const studentBadgesRelations = relations(studentBadges, ({ one }) => ({
    student: one(students, {
        fields: [studentBadges.studentId],
        references: [students.id],
    }),
    badge: one(badges, {
        fields: [studentBadges.badgeId],
        references: [badges.id],
    }),
}));

export const exercisesRelations = relations(exercises, ({ one, many }) => ({
    trainer: one(trainers, {
        fields: [exercises.trainerId],
        references: [trainers.id],
    }),
    workoutItems: many(workoutItems),
}));

export const workoutPlansRelations = relations(workoutPlans, ({ one, many }) => ({
    trainer: one(trainers, {
        fields: [workoutPlans.trainerId],
        references: [trainers.id],
    }),
    student: one(students, {
        fields: [workoutPlans.studentId],
        references: [students.id],
    }),
    workouts: many(workouts),
}));

export const workoutsRelations = relations(workouts, ({ one, many }) => ({
    trainer: one(trainers, {
        fields: [workouts.trainerId],
        references: [trainers.id],
    }),
    student: one(students, {
        fields: [workouts.studentId],
        references: [students.id],
    }),
    plan: one(workoutPlans, {
        fields: [workouts.planId],
        references: [workoutPlans.id],
    }),
    items: many(workoutItems),
}));

export const workoutItemsRelations = relations(workoutItems, ({ one }) => ({
    workout: one(workouts, {
        fields: [workoutItems.workoutId],
        references: [workouts.id],
    }),
    exercise: one(exercises, {
        fields: [workoutItems.exerciseId],
        references: [exercises.id],
    }),
}));

export const nutritionalPlansRelations = relations(nutritionalPlans, ({ one, many }) => ({
    trainer: one(trainers, {
        fields: [nutritionalPlans.trainerId],
        references: [trainers.id],
    }),
    student: one(students, {
        fields: [nutritionalPlans.studentId],
        references: [students.id],
    }),
    meals: many(meals),
}));

export const mealsRelations = relations(meals, ({ one, many }) => ({
    plan: one(nutritionalPlans, {
        fields: [meals.planId],
        references: [nutritionalPlans.id],
    }),
    items: many(mealItems),
}));

export const mealItemsRelations = relations(mealItems, ({ one }) => ({
    meal: one(meals, {
        fields: [mealItems.mealId],
        references: [meals.id],
    }),
}));

// --- Assessment Module ---

export const assessments = sqliteTable('assessments', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    trainerId: text('trainer_id').notNull().references(() => trainers.id),
    studentId: text('student_id').notNull().references(() => students.id),
    date: integer('date', { mode: 'timestamp' }).notNull(),
    method: text('method').notNull(), // 'pollock3' | 'pollock7' | 'guedes' | 'bioimpedance'

    // Anthropometry
    weight: integer('weight').notNull(), // in grams (to avoid float issues, or use real if preferred. Let's use grams: 80.5kg -> 80500)
    height: integer('height').notNull(), // in cm

    // Skinfolds (mm) - Nullable because method might be bioimpedance
    triceps: integer('triceps'),
    subscapular: integer('subscapular'),
    chest: integer('chest'),
    axillary: integer('axillary'),
    suprailiac: integer('suprailiac'),
    abdominal: integer('abdominal'),
    thigh: integer('thigh'),

    // Bioimpedance (Manual Inputs)
    bioimpedanceBodyFat: integer('bio_body_fat'), // stored as percentage * 100 (e.g. 15.5% -> 1550) or just float? SQLite handles real/float. Let's use REAL for percentages to be easier.
    bioimpedanceLeanMass: integer('bio_lean_mass'), // in grams

    // Circumferences (cm)
    neck: integer('neck'),
    shoulder: integer('shoulder'),
    chestCircumference: integer('chest_circumference'),
    waist: integer('waist'),
    abdomen: integer('abdomen'),
    hips: integer('hips'),
    armRight: integer('arm_right'),
    armLeft: integer('arm_left'),
    forearmRight: integer('forearm_right'),
    forearmLeft: integer('forearm_left'),
    thighRight: integer('thigh_right'),
    thighLeft: integer('thigh_left'),
    calfRight: integer('calf_right'),
    calfLeft: integer('calf_left'),

    // Calculated Results (Persisted for O(1) access)
    bodyFat: integer('body_fat'), // Percentage * 100 (e.g. 15.55% -> 1555)
    leanMass: integer('lean_mass'), // in grams
    fatMass: integer('fat_mass'), // in grams
    bmi: integer('bmi'), // * 100
    basalMetabolicRate: integer('bmr'), // kcal
    density: integer('density'), // * 10000 (e.g. 1.0550 -> 10550) - Precision matters here

    observations: text('observations'),

    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

export const assessmentPhotos = sqliteTable('assessment_photos', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    assessmentId: text('assessment_id').notNull().references(() => assessments.id, { onDelete: 'cascade' }),
    type: text('type').notNull(), // 'front', 'back', 'side_left', 'side_right', 'other'
    photoUrl: text('photo_url').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});



export const assessmentsRelations = relations(assessments, ({ one, many }) => ({
    trainer: one(trainers, {
        fields: [assessments.trainerId],
        references: [trainers.id],
    }),
    student: one(students, {
        fields: [assessments.studentId],
        references: [students.id],
    }),
    photos: many(assessmentPhotos),
}));

export const assessmentPhotosRelations = relations(assessmentPhotos, ({ one }) => ({
    assessment: one(assessments, {
        fields: [assessmentPhotos.assessmentId],
        references: [assessments.id],
    }),
}));


// --- Gamification & Logs Module ---

export const hydrationLogs = sqliteTable('hydration_logs', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    studentId: text('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
    date: integer('date', { mode: 'timestamp' }).notNull(),
    amountMl: integer('amount_ml').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

export const mealLogs = sqliteTable('meal_logs', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    studentId: text('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
    mealId: text('meal_id').references(() => meals.id), // Nullable for ad-hoc meals
    name: text('name'), // For ad-hoc meals (e.g. "Pizza")
    calories: integer('calories'), // Estimated calories for ad-hoc
    isCheatMeal: integer('is_cheat_meal', { mode: 'boolean' }).default(false),
    eatenAt: integer('eaten_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
    skipped: integer('skipped', { mode: 'boolean' }).default(false),
});

export const gamificationLogs = sqliteTable('gamification_logs', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    studentId: text('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
    action: text('action').notNull(), // 'workout_complete', 'meal_checkin', 'hydration_goal'
    xpEarned: integer('xp_earned').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

export const moodLogs = sqliteTable('mood_logs', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    studentId: text('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
    mood: text('mood').notNull(), // 'motivated', 'neutral', 'tired', 'sore'
    note: text('note'),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

// Relations for new tables
export const foodsRelations = relations(foods, ({ one }) => ({
    trainer: one(trainers, {
        fields: [foods.trainerId],
        references: [trainers.id],
    }),
}));

export const hydrationLogsRelations = relations(hydrationLogs, ({ one }) => ({
    student: one(students, {
        fields: [hydrationLogs.studentId],
        references: [students.id],
    }),
}));

export const mealLogsRelations = relations(mealLogs, ({ one }) => ({
    student: one(students, {
        fields: [mealLogs.studentId],
        references: [students.id],
    }),
    meal: one(meals, {
        fields: [mealLogs.mealId],
        references: [meals.id],
    }),
}));

export const gamificationLogsRelations = relations(gamificationLogs, ({ one }) => ({
    student: one(students, {
        fields: [gamificationLogs.studentId],
        references: [students.id],
    }),
}));

export const moodLogsRelations = relations(moodLogs, ({ one }) => ({
    student: one(students, {
        fields: [moodLogs.studentId],
        references: [students.id],
    }),
}));

// --- Training Execution Module ---

export const workoutLogs = sqliteTable('workout_logs', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    studentId: text('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
    workoutId: text('workout_id').notNull().references(() => workouts.id),
    startedAt: integer('started_at', { mode: 'timestamp' }).notNull(),
    endedAt: integer('ended_at', { mode: 'timestamp' }),
    status: text('status').default('in_progress'), // 'in_progress', 'completed', 'abandoned'
    notes: text('notes'),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

export const workoutLogSets = sqliteTable('workout_log_sets', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    logId: text('log_id').notNull().references(() => workoutLogs.id, { onDelete: 'cascade' }),
    exerciseId: text('exercise_id').notNull().references(() => exercises.id),
    setNumber: integer('set_number').notNull(),
    weight: integer('weight'), // in grams (e.g. 10000 = 10kg) - consistency with other mass fields
    reps: integer('reps').notNull(),
    rpe: integer('rpe'), // 1-10
    completed: integer('completed', { mode: 'boolean' }).default(true),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

export const workoutLogsRelations = relations(workoutLogs, ({ one, many }) => ({
    student: one(students, {
        fields: [workoutLogs.studentId],
        references: [students.id],
    }),
    workout: one(workouts, {
        fields: [workoutLogs.workoutId],
        references: [workouts.id],
    }),
    sets: many(workoutLogSets),
}));

export const workoutLogSetsRelations = relations(workoutLogSets, ({ one }) => ({
    log: one(workoutLogs, {
        fields: [workoutLogSets.logId],
        references: [workoutLogs.id],
    }),
    exercise: one(exercises, {
        fields: [workoutLogSets.exerciseId],
        references: [exercises.id],
    }),
}));

// Moved here to avoid circular dependency / TDZ issues
export const studentsRelations = relations(students, ({ one, many }) => ({
    trainer: one(trainers, {
        fields: [students.trainerId],
        references: [trainers.id],
    }),
    plan: one(plans, {
        fields: [students.planId],
        references: [plans.id],
    }),
    payments: many(payments),
    badges: many(studentBadges),
    workoutPlans: many(workoutPlans),
    workouts: many(workouts),
    nutritionalPlans: many(nutritionalPlans),
    // Added for Dashboard Cards
    moodLogs: many(moodLogs),
    workoutLogs: many(workoutLogs),
    hydrationLogs: many(hydrationLogs),
    gamificationLogs: many(gamificationLogs),
    forms: many(studentForms),
}));

// --- Dynamic Forms Module ---

export const forms = sqliteTable('forms', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    trainerId: text('trainer_id').notNull().references(() => trainers.id),
    title: text('title').notNull(),
    description: text('description'),
    type: text('type').default('checkin'), // 'checkin', 'onboarding', 'feedback', 'custom'
    triggerType: text('trigger_type').default('manual'), // 'manual', 'on_signup', 'weekly', 'monthly', 'no_plan'
    isActive: integer('is_active', { mode: 'boolean' }).default(true),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

export const formQuestions = sqliteTable('form_questions', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    formId: text('form_id').notNull().references(() => forms.id, { onDelete: 'cascade' }),
    order: integer('order').notNull(),
    type: text('type').notNull(), // 'text', 'long_text', 'number', 'scale', 'single_select', 'multi_select', 'date'
    question: text('question').notNull(),
    description: text('description'),
    options: text('options', { mode: 'json' }).$type<string[]>(), // For select types
    required: integer('required', { mode: 'boolean' }).default(true),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

export const studentForms = sqliteTable('student_forms', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    studentId: text('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
    formId: text('form_id').notNull().references(() => forms.id, { onDelete: 'cascade' }),
    status: text('status').default('pending'), // 'pending', 'viewed', 'completed'
    assignedAt: integer('assigned_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
    completedAt: integer('completed_at', { mode: 'timestamp' }),
});

export const formAnswers = sqliteTable('form_answers', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    responseId: text('response_id').notNull().references(() => studentForms.id, { onDelete: 'cascade' }),
    questionId: text('question_id').notNull().references(() => formQuestions.id),
    answer: text('answer'), // Stored as string, parse based on question type
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

// Relations for Forms
export const formsRelations = relations(forms, ({ one, many }) => ({
    trainer: one(trainers, {
        fields: [forms.trainerId],
        references: [trainers.id],
    }),
    questions: many(formQuestions),
    assignments: many(studentForms),
}));

export const formQuestionsRelations = relations(formQuestions, ({ one }) => ({
    form: one(forms, {
        fields: [formQuestions.formId],
        references: [forms.id],
    }),
}));

export const studentFormsRelations = relations(studentForms, ({ one, many }) => ({
    student: one(students, {
        fields: [studentForms.studentId],
        references: [students.id],
    }),
    form: one(forms, {
        fields: [studentForms.formId],
        references: [forms.id],
    }),
    answers: many(formAnswers),
}));

export const formAnswersRelations = relations(formAnswers, ({ one }) => ({
    response: one(studentForms, {
        fields: [formAnswers.responseId],
        references: [studentForms.id],
    }),
    question: one(formQuestions, {
        fields: [formAnswers.questionId],
        references: [formQuestions.id],
    }),
}));
