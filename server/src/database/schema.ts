import { MySql2Database } from 'drizzle-orm/mysql2';
import { accounts } from '../app/modules/account/schemas/accounts';
import { accountTokens } from '../app/modules/account-token/schemas/account-tokens';
import { brands } from '../app/modules/brand/schemas/brands';
import { categories } from '../app/modules/category/schemas/categories';
import { cities } from '../app/modules/city/schemas/cities';
import { countries } from '../app/modules/country/schemas/countries';
import { favoriteProducts } from '../app/modules/favorite-product/schemas/favorite-products';
import { products } from '../app/modules/product/schemas/products';
import { refreshTokens } from '../app/modules/refresh-token/schemas/refresh-tokens';
import { resumes } from '../app/modules/resume/schemas/resumes';
import { users } from '../app/modules/user/schemas/users';
import { vacancies } from '../app/modules/vacancy/schemas/vacancies';
import { viewedProducts } from '../app/modules/viewed-product/schemas/viewed-products';
import { newsletterSubscriptions } from '../app/modules/newsletter-subscription/schemas/newsletter-subscriptions';
import { chats } from '../app/modules/chat/schemas/chats';
import { messages } from '../app/modules/chat/schemas/messages';

export const databaseSchema = {
    accounts,
    accountTokens,
    brands,
    categories,
    cities,
    countries,
    favoriteProducts,
    products,
    refreshTokens,
    resumes,
    users,
    vacancies,
    viewedProducts,
    newsletterSubscriptions,
    chats,
    messages,
} as const;

export type Database = MySql2Database<typeof databaseSchema>;
