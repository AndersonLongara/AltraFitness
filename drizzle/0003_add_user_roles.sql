CREATE TABLE `foods` (
	`id` text PRIMARY KEY NOT NULL,
	`trainer_id` text,
	`name` text NOT NULL,
	`calories` integer NOT NULL,
	`protein` integer NOT NULL,
	`carbs` integer NOT NULL,
	`fat` integer NOT NULL,
	`base_unit` text DEFAULT 'g',
	`base_amount` integer DEFAULT 100,
	`category` text,
	`source` text DEFAULT 'system',
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`trainer_id`) REFERENCES `trainers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `form_answers` (
	`id` text PRIMARY KEY NOT NULL,
	`response_id` text NOT NULL,
	`question_id` text NOT NULL,
	`answer` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`response_id`) REFERENCES `student_forms`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`question_id`) REFERENCES `form_questions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `form_questions` (
	`id` text PRIMARY KEY NOT NULL,
	`form_id` text NOT NULL,
	`order` integer NOT NULL,
	`type` text NOT NULL,
	`question` text NOT NULL,
	`description` text,
	`options` text,
	`required` integer DEFAULT true,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`form_id`) REFERENCES `forms`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `forms` (
	`id` text PRIMARY KEY NOT NULL,
	`trainer_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`type` text DEFAULT 'checkin',
	`trigger_type` text DEFAULT 'manual',
	`is_active` integer DEFAULT true,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`trainer_id`) REFERENCES `trainers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `student_forms` (
	`id` text PRIMARY KEY NOT NULL,
	`student_id` text NOT NULL,
	`form_id` text NOT NULL,
	`status` text DEFAULT 'pending',
	`assigned_at` integer DEFAULT (strftime('%s', 'now')),
	`completed_at` integer,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`form_id`) REFERENCES `forms`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_roles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`role` text NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_meal_items` (
	`id` text PRIMARY KEY NOT NULL,
	`meal_id` text NOT NULL,
	`food_id` text,
	`food_name` text NOT NULL,
	`portion` integer NOT NULL,
	`unit` text DEFAULT 'g',
	`calories` integer,
	`protein` integer,
	`carbs` integer,
	`fat` integer,
	FOREIGN KEY (`meal_id`) REFERENCES `meals`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_meal_items`("id", "meal_id", "food_id", "food_name", "portion", "unit", "calories", "protein", "carbs", "fat") SELECT "id", "meal_id", "food_id", "food_name", "portion", "unit", "calories", "protein", "carbs", "fat" FROM `meal_items`;--> statement-breakpoint
DROP TABLE `meal_items`;--> statement-breakpoint
ALTER TABLE `__new_meal_items` RENAME TO `meal_items`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_nutritional_plans` (
	`id` text PRIMARY KEY NOT NULL,
	`trainer_id` text NOT NULL,
	`student_id` text,
	`title` text NOT NULL,
	`daily_kcal` integer NOT NULL,
	`protein_g` integer NOT NULL,
	`carbs_g` integer NOT NULL,
	`fat_g` integer NOT NULL,
	`water_goal_ml` integer DEFAULT 2500,
	`days_of_week` text,
	`is_template` integer DEFAULT false,
	`active` integer DEFAULT true,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`trainer_id`) REFERENCES `trainers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_nutritional_plans`("id", "trainer_id", "student_id", "title", "daily_kcal", "protein_g", "carbs_g", "fat_g", "water_goal_ml", "days_of_week", "is_template", "active", "created_at", "updated_at") SELECT "id", "trainer_id", "student_id", "title", "daily_kcal", "protein_g", "carbs_g", "fat_g", "water_goal_ml", "days_of_week", "is_template", "active", "created_at", "updated_at" FROM `nutritional_plans`;--> statement-breakpoint
DROP TABLE `nutritional_plans`;--> statement-breakpoint
ALTER TABLE `__new_nutritional_plans` RENAME TO `nutritional_plans`;--> statement-breakpoint
ALTER TABLE `students` ADD `birth_date` integer;--> statement-breakpoint
ALTER TABLE `students` ADD `gender` text;--> statement-breakpoint
ALTER TABLE `students` ADD `height` integer;--> statement-breakpoint
ALTER TABLE `students` ADD `weight` integer;--> statement-breakpoint
ALTER TABLE `trainers` ADD `cpf` text;--> statement-breakpoint
ALTER TABLE `trainers` ADD `phone` text;--> statement-breakpoint
ALTER TABLE `trainers` ADD `birth_date` integer;--> statement-breakpoint
ALTER TABLE `trainers` ADD `presential_students` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `trainers` ADD `online_students` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `trainers` ADD `team_code` text;--> statement-breakpoint
ALTER TABLE `trainers` ADD `subscription_plan` text DEFAULT 'free';--> statement-breakpoint
ALTER TABLE `trainers` ADD `subscription_status` text DEFAULT 'active';--> statement-breakpoint
ALTER TABLE `trainers` ADD `trial_ends_at` integer;--> statement-breakpoint
CREATE UNIQUE INDEX `trainers_team_code_unique` ON `trainers` (`team_code`);