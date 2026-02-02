import { mysqlTable, char, varchar, text, boolean, timestamp } from 'drizzle-orm/mysql-core';
import { InferInsertModel } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import { users, UserShort } from '../../user/schemas/users';
import { cities, City, CityShort } from '../../city/schemas/cities';

export const vacancies = mysqlTable('Vacancies', {
    id: char('id', { length: 36 }).primaryKey(),
    userId: varchar('userId', { length: 255 }).notNull(),
    firstName: varchar('firstName', { length: 255 }).notNull(),
    lastName: varchar('lastName', { length: 255 }),
    companyName: varchar('companyName', { length: 255 }).notNull(),
    position: varchar('position', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 50 }),
    cityId: char('cityId', { length: 36 }).notNull(),
    address: varchar('address', { length: 512 }).notNull(),
    description: text('description').notNull(),
    isActive: boolean('isActive').notNull().default(true),
    isDeleted: boolean('isDeleted').notNull().default(false),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export const vacanciesRelations = relations(vacancies, ({ one }) => ({
    user: one(users, {
        fields: [vacancies.userId],
        references: [users.tgId],
    }),
    city: one(cities, {
        fields: [vacancies.cityId],
        references: [cities.id],
    }),
}));

export type Vacancy = {
    id: string;
    firstName: string;
    lastName: string | null;
    companyName: string;
    position: string;
    phone: string | null;
    address: string;
    description: string;
    isActive: boolean;
    isDeleted: boolean;
    city: CityShort | null;
    user: UserShort | null;
    updatedAt: Date;
};

export type NewVacancy = InferInsertModel<typeof vacancies>;
