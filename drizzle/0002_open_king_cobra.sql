CREATE TABLE `assessment_photos` (
	`id` text PRIMARY KEY NOT NULL,
	`assessment_id` text NOT NULL,
	`type` text NOT NULL,
	`photo_url` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`assessment_id`) REFERENCES `assessments`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `assessments` (
	`id` text PRIMARY KEY NOT NULL,
	`trainer_id` text NOT NULL,
	`student_id` text NOT NULL,
	`date` integer NOT NULL,
	`method` text NOT NULL,
	`weight` integer NOT NULL,
	`height` integer NOT NULL,
	`triceps` integer,
	`subscapular` integer,
	`chest` integer,
	`axillary` integer,
	`suprailiac` integer,
	`abdominal` integer,
	`thigh` integer,
	`bio_body_fat` integer,
	`bio_lean_mass` integer,
	`neck` integer,
	`shoulder` integer,
	`chest_circumference` integer,
	`waist` integer,
	`abdomen` integer,
	`hips` integer,
	`arm_right` integer,
	`arm_left` integer,
	`forearm_right` integer,
	`forearm_left` integer,
	`thigh_right` integer,
	`thigh_left` integer,
	`calf_right` integer,
	`calf_left` integer,
	`body_fat` integer,
	`lean_mass` integer,
	`fat_mass` integer,
	`bmi` integer,
	`bmr` integer,
	`density` integer,
	`observations` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`trainer_id`) REFERENCES `trainers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `badges` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`icon` text NOT NULL,
	`xp_required` integer NOT NULL,
	`color` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE TABLE `gamification_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`student_id` text NOT NULL,
	`action` text NOT NULL,
	`xp_earned` integer NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `hydration_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`student_id` text NOT NULL,
	`date` integer NOT NULL,
	`amount_ml` integer NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` text PRIMARY KEY NOT NULL,
	`trainer_id` text NOT NULL,
	`name` text NOT NULL,
	`phone` text,
	`social_handle` text,
	`photo_url` text,
	`pipeline_stage` text DEFAULT 'new',
	`estimated_value` integer DEFAULT 0,
	`temperature` text DEFAULT 'warm',
	`stage_data` text,
	`last_contact_at` integer,
	`status` text DEFAULT 'new',
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`trainer_id`) REFERENCES `trainers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `meal_items` (
	`id` text PRIMARY KEY NOT NULL,
	`meal_id` text NOT NULL,
	`food_name` text NOT NULL,
	`portion` text NOT NULL,
	`calories` integer,
	`protein` integer,
	`carbs` integer,
	`fat` integer,
	FOREIGN KEY (`meal_id`) REFERENCES `meals`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `meal_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`student_id` text NOT NULL,
	`meal_id` text,
	`name` text,
	`calories` integer,
	`is_cheat_meal` integer DEFAULT false,
	`eaten_at` integer DEFAULT (strftime('%s', 'now')),
	`skipped` integer DEFAULT false,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`meal_id`) REFERENCES `meals`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `meals` (
	`id` text PRIMARY KEY NOT NULL,
	`plan_id` text NOT NULL,
	`name` text NOT NULL,
	`time` text,
	`order` integer NOT NULL,
	FOREIGN KEY (`plan_id`) REFERENCES `nutritional_plans`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `mood_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`student_id` text NOT NULL,
	`mood` text NOT NULL,
	`note` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `nutritional_plans` (
	`id` text PRIMARY KEY NOT NULL,
	`trainer_id` text NOT NULL,
	`student_id` text NOT NULL,
	`title` text NOT NULL,
	`daily_kcal` integer NOT NULL,
	`protein_g` integer NOT NULL,
	`carbs_g` integer NOT NULL,
	`fat_g` integer NOT NULL,
	`active` integer DEFAULT true,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`trainer_id`) REFERENCES `trainers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`trainer_id` text NOT NULL,
	`student_id` text NOT NULL,
	`plan_id` text,
	`amount` integer NOT NULL,
	`due_date` integer NOT NULL,
	`paid_at` integer,
	`status` text DEFAULT 'pending',
	`method` text,
	`notes` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`trainer_id`) REFERENCES `trainers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `plans` (
	`id` text PRIMARY KEY NOT NULL,
	`trainer_id` text NOT NULL,
	`name` text NOT NULL,
	`price` integer NOT NULL,
	`duration_months` integer NOT NULL,
	`active` integer DEFAULT true,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`trainer_id`) REFERENCES `trainers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `student_badges` (
	`id` text PRIMARY KEY NOT NULL,
	`student_id` text NOT NULL,
	`badge_id` text NOT NULL,
	`earned_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`badge_id`) REFERENCES `badges`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `workout_log_sets` (
	`id` text PRIMARY KEY NOT NULL,
	`log_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`set_number` integer NOT NULL,
	`weight` integer,
	`reps` integer NOT NULL,
	`rpe` integer,
	`completed` integer DEFAULT true,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`log_id`) REFERENCES `workout_logs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `workout_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`student_id` text NOT NULL,
	`workout_id` text NOT NULL,
	`started_at` integer NOT NULL,
	`ended_at` integer,
	`status` text DEFAULT 'in_progress',
	`notes` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workout_id`) REFERENCES `workouts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `workout_plans` (
	`id` text PRIMARY KEY NOT NULL,
	`trainer_id` text NOT NULL,
	`student_id` text,
	`name` text NOT NULL,
	`is_template` integer DEFAULT false,
	`active` integer DEFAULT true,
	`cardio` text,
	`observations` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`trainer_id`) REFERENCES `trainers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`trainer_id` text,
	`name` text NOT NULL,
	`muscle_group` text NOT NULL,
	`video_url` text,
	`description` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`trainer_id`) REFERENCES `trainers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_exercises`("id", "trainer_id", "name", "muscle_group", "video_url", "description", "created_at", "updated_at") SELECT "id", "trainer_id", "name", "muscle_group", "video_url", "description", "created_at", "updated_at" FROM `exercises`;--> statement-breakpoint
DROP TABLE `exercises`;--> statement-breakpoint
ALTER TABLE `__new_exercises` RENAME TO `exercises`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_workouts` (
	`id` text PRIMARY KEY NOT NULL,
	`trainer_id` text NOT NULL,
	`student_id` text,
	`plan_id` text,
	`title` text NOT NULL,
	`status` text DEFAULT 'pending',
	`scheduled_date` integer,
	`completed_at` integer,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`trainer_id`) REFERENCES `trainers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`plan_id`) REFERENCES `workout_plans`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_workouts`("id", "trainer_id", "student_id", "plan_id", "title", "status", "scheduled_date", "completed_at", "created_at", "updated_at") SELECT "id", "trainer_id", "student_id", "plan_id", "title", "status", "scheduled_date", "completed_at", "created_at", "updated_at" FROM `workouts`;--> statement-breakpoint
DROP TABLE `workouts`;--> statement-breakpoint
ALTER TABLE `__new_workouts` RENAME TO `workouts`;--> statement-breakpoint
ALTER TABLE `students` ADD `cpf` text;--> statement-breakpoint
ALTER TABLE `students` ADD `plan_id` text REFERENCES plans(id);--> statement-breakpoint
ALTER TABLE `students` ADD `xp` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `students` ADD `access_types` text;--> statement-breakpoint
ALTER TABLE `students` ADD `invite_token` text;--> statement-breakpoint
ALTER TABLE `students` ADD `level` integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE `students` ADD `current_xp` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `students` ADD `current_streak` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `students` ADD `longest_streak` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `students` ADD `last_activity_date` integer;--> statement-breakpoint
CREATE UNIQUE INDEX `students_invite_token_unique` ON `students` (`invite_token`);--> statement-breakpoint
ALTER TABLE `workout_items` ADD `warmup_sets` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `workout_items` ADD `preparatory_sets` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `workout_items` ADD `is_superset` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `workout_items` ADD `advanced_techniques` text;