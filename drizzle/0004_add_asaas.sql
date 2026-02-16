CREATE TABLE `platform_charges` (
	`id` text PRIMARY KEY NOT NULL,
	`trainer_id` text NOT NULL,
	`amount` integer NOT NULL,
	`due_date` integer NOT NULL,
	`description` text,
	`status` text DEFAULT 'pending',
	`paid_at` integer,
	`asaas_payment_id` text,
	`asaas_invoice_url` text,
	`billing_type` text DEFAULT 'UNDEFINED',
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`trainer_id`) REFERENCES `trainers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `payments` ADD `asaas_payment_id` text;--> statement-breakpoint
ALTER TABLE `payments` ADD `asaas_invoice_url` text;--> statement-breakpoint
ALTER TABLE `payments` ADD `billing_type` text;--> statement-breakpoint
ALTER TABLE `students` ADD `asaas_customer_id` text;--> statement-breakpoint
ALTER TABLE `trainers` ADD `asaas_customer_id` text;--> statement-breakpoint
ALTER TABLE `trainers` ADD `asaas_api_key` text;