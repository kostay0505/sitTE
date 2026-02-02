import { mysqlTable, char, varchar, boolean, timestamp } from 'drizzle-orm/mysql-core';
import { InferSelectModel } from 'drizzle-orm';

export const countries = mysqlTable('Countries', {
    id: char('id', { length: 36 }).primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    isActive: boolean('isActive').notNull().default(true),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type Country = InferSelectModel<typeof countries>;

export type CountryShort = {
    id: string;
    name: string;
};
