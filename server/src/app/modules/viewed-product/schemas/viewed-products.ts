import { mysqlTable, char, varchar, timestamp } from 'drizzle-orm/mysql-core';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import { products } from '../../product/schemas/products';
import { users } from '../../user/schemas/users';

export const viewedProducts = mysqlTable('ViewedProducts', {
    userId: varchar('userId', { length: 255 }).notNull(),
    productId: char('productId', { length: 36 }).notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
}, (table) => {
    return {
        pk: [table.userId, table.productId],
    };
});

export const viewedProductsRelations = relations(viewedProducts, ({ one }) => ({
    product: one(products, {
        fields: [viewedProducts.productId],
        references: [products.id],
    }),
    user: one(users, {
        fields: [viewedProducts.userId],
        references: [users.tgId],
    }),
}));

export type ViewedProduct = InferSelectModel<typeof viewedProducts>;
export type NewViewedProduct = InferInsertModel<typeof viewedProducts>;
