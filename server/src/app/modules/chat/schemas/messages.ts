import { mysqlTable, varchar, text, boolean, timestamp } from 'drizzle-orm/mysql-core';

export const messages = mysqlTable('Messages', {
  id: varchar('id', { length: 36 }).primaryKey(),
  chatId: varchar('chatId', { length: 36 }).notNull(),
  senderId: varchar('senderId', { length: 255 }).notNull(),
  body: text('body'),
  imageUrl: varchar('imageUrl', { length: 500 }),
  isRead: boolean('isRead').default(false).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});
