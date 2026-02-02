ALTER TABLE `Users` ADD `isBanned` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `Users` ADD `emailVerified` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `Users` ADD `passwordHash` varchar(255);--> statement-breakpoint
ALTER TABLE `Users` ADD `emailVerificationCode` varchar(255);--> statement-breakpoint
ALTER TABLE `Users` ADD `resetPasswordCode` varchar(255);--> statement-breakpoint
ALTER TABLE `FavoriteProducts` ADD CONSTRAINT `FavoriteProducts_userId_productId_unique` UNIQUE(`userId`,`productId`);