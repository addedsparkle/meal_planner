CREATE TABLE `ingredients` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`default_unit` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ingredient_name_unique` ON `ingredients` (`id`,`name`);--> statement-breakpoint
CREATE TABLE `recipes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`main_protein` text,
	`meal` text,
	`instructions` text,
	`can_batch` integer,
	`last_used` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `recipe_name_unique` ON `recipes` (`id`,`name`);--> statement-breakpoint
CREATE TABLE `recipes_to_ingredients` (
	`recipe_id` integer NOT NULL,
	`ingredient_id` integer NOT NULL,
	`unit` text NOT NULL,
	`amount` integer NOT NULL,
	PRIMARY KEY(`recipe_id`, `ingredient_id`),
	FOREIGN KEY (`recipe_id`) REFERENCES `recipes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients`(`id`) ON UPDATE no action ON DELETE no action
);
