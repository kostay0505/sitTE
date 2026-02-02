import { mysqlTable, varchar, char, timestamp, text } from 'drizzle-orm/mysql-core';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import { users } from '../../user/schemas/users';

export const refreshTokens = mysqlTable('RefreshTokens', {
  id: char('id', { length: 36 }).primaryKey(),
  token: text('token').notNull(),
  userId: varchar('userId', { length: 255 }).notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  ip: varchar('ip', { length: 255 }),
  userAgent: varchar('userAgent', { length: 255 }),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.tgId],
  }),
}));

export type RefreshToken = InferSelectModel<typeof refreshTokens>;
export type NewRefreshToken = InferInsertModel<typeof refreshTokens>;