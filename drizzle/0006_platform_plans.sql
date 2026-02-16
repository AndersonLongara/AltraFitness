CREATE TABLE `platform_plans` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL UNIQUE,
	`name` text NOT NULL,
	`price_cents` integer DEFAULT 0 NOT NULL,
	`duration_months` integer DEFAULT 1 NOT NULL,
	`max_students` integer,
	`features` text,
	`has_ai` integer DEFAULT false,
	`has_priority` integer DEFAULT false,
	`active` integer DEFAULT true,
	`sort_order` integer DEFAULT 0,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now'))
);
