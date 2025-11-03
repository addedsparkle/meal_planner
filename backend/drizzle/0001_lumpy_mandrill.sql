PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_recipes_to_ingredients` (
	`recipe_id` integer NOT NULL,
	`ingredient_id` integer NOT NULL,
	`unit` text,
	`amount` integer NOT NULL,
	PRIMARY KEY(`recipe_id`, `ingredient_id`),
	FOREIGN KEY (`recipe_id`) REFERENCES `recipes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_recipes_to_ingredients`("recipe_id", "ingredient_id", "unit", "amount") SELECT "recipe_id", "ingredient_id", "unit", "amount" FROM `recipes_to_ingredients`;--> statement-breakpoint
DROP TABLE `recipes_to_ingredients`;--> statement-breakpoint
ALTER TABLE `__new_recipes_to_ingredients` RENAME TO `recipes_to_ingredients`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `ingredients` DROP COLUMN `default_unit`;