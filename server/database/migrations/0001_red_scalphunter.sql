CREATE TABLE `Brands` (
	`id` char(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`photo` varchar(1024) NOT NULL,
	`description` text NOT NULL,
	`displayOrder` int NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `Brands_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `Categories` (
	`id` char(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`parentId` char(36),
	`displayOrder` int NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `Categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `Cities` (
	`id` char(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`countryId` char(36),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `Cities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `Countries` (
	`id` char(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `Countries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `FavoriteProducts` (
	`userId` varchar(255) NOT NULL,
	`productId` char(36) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `Products` (
	`id` char(36) NOT NULL,
	`userId` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`priceCash` decimal(10,2) NOT NULL,
	`priceNonCash` decimal(10,2) NOT NULL,
	`currency` varchar(255) NOT NULL,
	`preview` varchar(255) NOT NULL,
	`files` text NOT NULL,
	`description` text NOT NULL,
	`categoryId` char(36) NOT NULL,
	`brandId` char(36) NOT NULL,
	`quantity` int NOT NULL,
	`quantityType` varchar(255) NOT NULL,
	`status` varchar(255) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`isDeleted` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `Products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `Resumes` (
	`id` char(36) NOT NULL,
	`userId` varchar(255) NOT NULL,
	`firstName` varchar(255) NOT NULL,
	`lastName` varchar(255),
	`position` varchar(255) NOT NULL,
	`phone` varchar(50),
	`cityId` char(36) NOT NULL,
	`description` text NOT NULL,
	`files` text NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`isDeleted` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `Resumes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `Vacancies` (
	`id` char(36) NOT NULL,
	`userId` varchar(255) NOT NULL,
	`firstName` varchar(255) NOT NULL,
	`lastName` varchar(255),
	`companyName` varchar(255) NOT NULL,
	`position` varchar(255) NOT NULL,
	`phone` varchar(50),
	`cityId` char(36) NOT NULL,
	`address` varchar(512) NOT NULL,
	`description` text NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`isDeleted` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `Vacancies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ViewedProducts` (
	`userId` varchar(255) NOT NULL,
	`productId` char(36) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now())
);
--> statement-breakpoint
ALTER TABLE `AccountTokens` ADD `userId` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `Accounts` ADD `userId` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `Users` ADD `email` varchar(255);--> statement-breakpoint
ALTER TABLE `Users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `Users` ADD `cityId` char(36);--> statement-breakpoint
ALTER TABLE `Users` ADD `subscribedToNewsletter` boolean DEFAULT true NOT NULL;