import {
  mysqlTable,
  char,
  varchar,
  text,
  boolean,
  int,
  timestamp
} from 'drizzle-orm/mysql-core';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export const brands = mysqlTable('Brands', {
  id: char('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  photo: varchar('photo', { length: 1024 }).notNull(),
  description: text('description').notNull(),
  contact: varchar('contact', { length: 255 }),
  displayOrder: int('displayOrder').notNull(),
  isActive: boolean('isActive').notNull().default(true),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull()
});

export type Brand = InferSelectModel<typeof brands> & { url?: string };

export type BrandShort = {
  id: string;
  name: string;
  photo: string;
  contact: string;
  productCount?: number;
  description: string;
};

export type NewBrand = InferInsertModel<typeof brands>;
