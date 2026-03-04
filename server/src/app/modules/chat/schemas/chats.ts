import { mysqlTable, varchar, int, timestamp } from 'drizzle-orm/mysql-core';

export const chats = mysqlTable('Chats', {
  id: varchar('id', { length: 36 }).primaryKey(),
  productId: varchar('productId', { length: 36 }).notNull(),
  buyerId: varchar('buyerId', { length: 255 }).notNull(),
  sellerId: varchar('sellerId', { length: 255 }).notNull(),
  unreadBuyer: int('unreadBuyer').default(0).notNull(),
  unreadSeller: int('unreadSeller').default(0).notNull(),
  lastMessageAt: timestamp('lastMessageAt').defaultNow().notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});
