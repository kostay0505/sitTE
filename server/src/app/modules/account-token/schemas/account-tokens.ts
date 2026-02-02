import { mysqlTable, varchar, char, timestamp, text } from 'drizzle-orm/mysql-core';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import { accounts } from '../../account/schemas/accounts';
import { users } from '../../user/schemas/users';

export const accountTokens = mysqlTable('AccountTokens', {
  id: char('id', { length: 36 }).primaryKey(),
  accountId: char('accountId', { length: 36 }).notNull(),
  token: text('token').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  ip: varchar('ip', { length: 255 }),
  userAgent: varchar('userAgent', { length: 255 }),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export const accountTokensRelations = relations(accountTokens, ({ one }) => ({
  account: one(accounts, {
    fields: [accountTokens.accountId],
    references: [accounts.id],
  }),
}));

export type AccountToken = InferSelectModel<typeof accountTokens>;
export type NewAccountToken = InferInsertModel<typeof accountTokens>;