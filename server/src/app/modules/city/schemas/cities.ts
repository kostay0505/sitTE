import { mysqlTable, char, varchar, boolean, timestamp } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { countries, CountryShort } from '../../country/schemas/countries';

export const cities = mysqlTable('Cities', {
    id: char('id', { length: 36 }).primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    countryId: char('countryId', { length: 36 }),
    isActive: boolean('isActive').notNull().default(true),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export const citiesRelations = relations(cities, ({ one }) => ({
    country: one(countries, {
        fields: [cities.countryId],
        references: [countries.id],
    }),
}));

export type City = {
    id: string;
    name: string;
    isActive: boolean;
    country: CountryShort | null;
};

export type CityShort = {
    id: string;
    name: string;
    country: CountryShort | null;
};
