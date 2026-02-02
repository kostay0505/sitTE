import { mysqlTable, char, varchar, boolean, timestamp, unique } from 'drizzle-orm/mysql-core';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import { products } from '../../product/schemas/products';
import { users } from '../../user/schemas/users';

export const favoriteProducts = mysqlTable('FavoriteProducts', {
    userId: varchar('userId', { length: 255 }).notNull(),
    productId: char('productId', { length: 36 }).notNull(),
    isActive: boolean('isActive').notNull().default(true),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
}, (table) => {
    return {
        userProductUnique: unique('FavoriteProducts_userId_productId_unique').on(table.userId, table.productId),
    };
});

export const favoriteProductsRelations = relations(favoriteProducts, ({ one }) => ({
    product: one(products, {
        fields: [favoriteProducts.productId],
        references: [products.id],
    }),
    user: one(users, {
        fields: [favoriteProducts.userId],
        references: [users.tgId],
    }),
}));

export type FavoriteProduct = InferSelectModel<typeof favoriteProducts>;
export type NewFavoriteProduct = InferInsertModel<typeof favoriteProducts>;
