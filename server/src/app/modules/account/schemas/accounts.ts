import { mysqlTable, varchar, char, timestamp } from 'drizzle-orm/mysql-core';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import { accountTokens } from '../../account-token/schemas/account-tokens';

export const accounts = mysqlTable('Accounts', {
  id: char('id', { length: 36 }).primaryKey(),
  login: varchar('login', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export const accountsRelations = relations(accounts, ({ many }) => ({
  tokens: many(accountTokens),
}));

export type Account = InferSelectModel<typeof accounts>;
export type NewAccount = InferInsertModel<typeof accounts>;