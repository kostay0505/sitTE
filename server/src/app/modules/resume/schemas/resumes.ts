import { mysqlTable, char, varchar, text, boolean, timestamp } from 'drizzle-orm/mysql-core';
import { InferInsertModel } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import { users, UserShort } from '../../user/schemas/users';
import { cities, City, CityShort } from '../../city/schemas/cities';

export const resumes = mysqlTable('Resumes', {
    id: char('id', { length: 36 }).primaryKey(),
    userId: varchar('userId', { length: 255 }).notNull(),
    firstName: varchar('firstName', { length: 255 }).notNull(),
    lastName: varchar('lastName', { length: 255 }),
    position: varchar('position', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 50 }),
    cityId: char('cityId', { length: 36 }).notNull(),
    description: text('description').notNull(),
    files: text('files').notNull(),
    isActive: boolean('isActive').notNull().default(true),
    isDeleted: boolean('isDeleted').notNull().default(false),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export const resumesRelations = relations(resumes, ({ one }) => ({
    user: one(users, {
        fields: [resumes.userId],
        references: [users.tgId],
    }),
    city: one(cities, {
        fields: [resumes.cityId],
        references: [cities.id],
    }),
}));

export type Resume = {
    id: string;
    firstName: string;
    lastName: string | null;
    position: string;
    phone: string | null;
    description: string;
    files: string;
    isActive: boolean;
    isDeleted: boolean;
    city: CityShort | null;
    user: UserShort | null;
    updatedAt: Date;
};

export type NewResume = InferInsertModel<typeof resumes>;
