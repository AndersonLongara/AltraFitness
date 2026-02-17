CREATE TABLE `favorite_foods` (
	`id` text PRIMARY KEY NOT NULL,
	`trainer_id` text NOT NULL,
	`food_id` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`trainer_id`) REFERENCES `trainers`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`food_id`) REFERENCES `foods`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `favorite_exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`trainer_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`trainer_id`) REFERENCES `trainers`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE UNIQUE INDEX `fav_food_unique` ON `favorite_foods` (`trainer_id`, `food_id`);
CREATE UNIQUE INDEX `fav_exercise_unique` ON `favorite_exercises` (`trainer_id`, `exercise_id`);
