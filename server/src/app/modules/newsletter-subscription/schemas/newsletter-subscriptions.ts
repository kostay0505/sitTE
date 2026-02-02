import {
  mysqlTable,
  varchar,
  timestamp,
  boolean
} from 'drizzle-orm/mysql-core';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export const newsletterSubscriptions = mysqlTable('NewsletterSubscriptions', {
  email: varchar('email', { length: 255 }).primaryKey(),
  isActive: boolean('isActive').default(true).notNull(),
  isDelete: boolean('isDelete').default(false).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull()
});

export type NewsletterSubscription = InferSelectModel<
  typeof newsletterSubscriptions
>;
export type NewNewsletterSubscription = InferInsertModel<
  typeof newsletterSubscriptions
>;
