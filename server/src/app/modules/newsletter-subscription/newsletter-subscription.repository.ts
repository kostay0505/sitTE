import { Injectable, Inject } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { Database } from '../../../database/schema';
import { newsletterSubscriptions } from './schemas/newsletter-subscriptions';
import { type NewsletterSubscription } from './schemas/newsletter-subscriptions';
import { SqlQueryResult } from '../../../database/utils';
import { users } from '../user/schemas/users';

@Injectable()
export class NewsletterSubscriptionRepository {
  constructor(@Inject('DATABASE') private readonly db: Database) {}

  async findByEmail(email: string): Promise<NewsletterSubscription | null> {
    const result = (await this.db.execute(sql`
      SELECT email, isActive, isDelete, createdAt
      FROM ${newsletterSubscriptions}
      WHERE ${newsletterSubscriptions.email} = ${email}
    `)) as SqlQueryResult<NewsletterSubscription>;

    if (!Array.isArray(result[0]) || !result[0][0]) return null;

    return result[0][0];
  }

  async create(
    email: string,
    isDelete: boolean = false
  ): Promise<NewsletterSubscription> {
    await this.db.insert(newsletterSubscriptions).values({
      email: email.toLowerCase().trim(),
      isDelete
    });

    const result = await this.findByEmailIncludingDeleted(email);

    if (!result) {
      throw new Error('Newsletter subscription not created');
    }

    return result;
  }

  async findAll(): Promise<NewsletterSubscription[]> {
    const result = (await this.db.execute(sql`
      SELECT email, isActive, isDelete, createdAt
      FROM ${newsletterSubscriptions}
      WHERE ${newsletterSubscriptions.isDelete} = false
      ORDER BY ${newsletterSubscriptions.createdAt} DESC
    `)) as SqlQueryResult<NewsletterSubscription>;

    if (!Array.isArray(result[0])) {
      throw new Error('Unexpected query result format');
    }

    return result[0];
  }

  async updateStatus(email: string, isActive: boolean): Promise<boolean> {
    await this.db
      .update(newsletterSubscriptions)
      .set({ isActive })
      .where(eq(newsletterSubscriptions.email, email));
    return true;
  }

  async delete(email: string): Promise<boolean> {
    await this.db
      .update(newsletterSubscriptions)
      .set({ isDelete: true })
      .where(eq(newsletterSubscriptions.email, email));
    return true;
  }

  async findAllUserEmails(): Promise<
    Array<{ email: string; isActive: boolean }>
  > {
    const result = (await this.db.execute(sql`
      SELECT DISTINCT email, subscribedToNewsletter as isActive
      FROM ${users}
      WHERE email IS NOT NULL AND email != ''
    `)) as SqlQueryResult<{ email: string; isActive: boolean }>;

    if (!Array.isArray(result[0])) {
      throw new Error('Unexpected query result format');
    }

    return result[0].map(row => ({
      email: row.email.toLowerCase().trim(),
      isActive: Boolean(row.isActive)
    }));
  }

  async findByEmailIncludingDeleted(
    email: string
  ): Promise<NewsletterSubscription | null> {
    const result = (await this.db.execute(sql`
      SELECT email, isActive, isDelete, createdAt
      FROM ${newsletterSubscriptions}
      WHERE ${newsletterSubscriptions.email} = ${email}
    `)) as SqlQueryResult<NewsletterSubscription>;

    if (!Array.isArray(result[0]) || !result[0][0]) return null;

    return result[0][0];
  }
}
