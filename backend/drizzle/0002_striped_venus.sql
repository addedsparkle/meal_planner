CREATE TABLE `meal_plans` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`start_date` integer NOT NULL,
	`end_date` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `meal_plans_to_recipes` (
	`plan_id` integer NOT NULL,
	`recipe_id` integer NOT NULL,
	`day` text NOT NULL,
	`meal_type` text,
	PRIMARY KEY(`plan_id`, `recipe_id`, `day`),
	FOREIGN KEY (`plan_id`) REFERENCES `meal_plans`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`recipe_id`) REFERENCES `recipes`(`id`) ON UPDATE no action ON DELETE no action
);
