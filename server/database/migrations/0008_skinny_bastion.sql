CREATE TABLE `NewsletterSubscriptions` (
	`email` varchar(255) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `NewsletterSubscriptions_email` PRIMARY KEY(`email`)
);
