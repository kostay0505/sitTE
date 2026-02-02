import {
  Injectable,
  ConflictException,
  NotFoundException
} from '@nestjs/common';
import { NewsletterSubscriptionRepository } from './newsletter-subscription.repository';
import { CreateNewsletterSubscriptionDto } from './dto/create-newsletter-subscription.dto';
import { type NewsletterSubscription } from './schemas/newsletter-subscriptions';

@Injectable()
export class NewsletterSubscriptionService {
  constructor(private readonly repository: NewsletterSubscriptionRepository) {}

  async subscribe(
    dto: CreateNewsletterSubscriptionDto
  ): Promise<{ message: string }> {
    const normalizedEmail = dto.email.toLowerCase().trim();
    const existing = await this.repository.findByEmail(normalizedEmail);

    if (existing) {
      throw new ConflictException('Email уже подписан на рассылку');
    }

    await this.repository.create(normalizedEmail);

    return { message: 'Вы успешно подписались на рассылку' };
  }

  async findAll(): Promise<NewsletterSubscription[]> {
    const subscriptions = await this.repository.findAll();
    const userEmails = await this.repository.findAllUserEmails();

    const subscriptionMap = new Map<string, NewsletterSubscription>();
    subscriptions.forEach(sub => {
      subscriptionMap.set(sub.email.toLowerCase().trim(), sub);
    });

    for (const userEmail of userEmails) {
      const existingSub = subscriptionMap.get(userEmail.email);
      if (!existingSub) {
        const deletedSub = await this.repository.findByEmailIncludingDeleted(
          userEmail.email
        );
        if (!deletedSub || !deletedSub.isDelete) {
          subscriptionMap.set(userEmail.email, {
            email: userEmail.email,
            isActive: userEmail.isActive,
            isDelete: false,
            createdAt: new Date()
              .toISOString()
              .slice(0, 19)
              .replace('T', ' ') as any
          });
        }
      }
    }

    return Array.from(subscriptionMap.values())
      .filter(sub => !sub.isDelete)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  async toggleStatus(email: string): Promise<NewsletterSubscription> {
    const normalizedEmail = email.toLowerCase().trim();
    let subscription = await this.repository.findByEmail(normalizedEmail);

    if (!subscription) {
      const userEmails = await this.repository.findAllUserEmails();
      const userEmail = userEmails.find(ue => ue.email === normalizedEmail);

      if (userEmail) {
        await this.repository.create(normalizedEmail);
        subscription = await this.repository.findByEmail(normalizedEmail);

        if (!subscription) {
          throw new Error('Failed to create subscription');
        }
      } else {
        throw new NotFoundException('Подписка не найдена');
      }
    }

    await this.repository.updateStatus(normalizedEmail, !subscription.isActive);

    const updated = await this.repository.findByEmail(normalizedEmail);

    if (!updated) {
      throw new Error('Failed to update subscription');
    }

    return updated;
  }

  async delete(email: string): Promise<NewsletterSubscription> {
    const normalizedEmail = email.toLowerCase().trim();
    let subscription =
      await this.repository.findByEmailIncludingDeleted(normalizedEmail);

    if (!subscription) {
      const userEmails = await this.repository.findAllUserEmails();
      const userEmail = userEmails.find(ue => ue.email === normalizedEmail);

      if (userEmail) {
        subscription = await this.repository.create(normalizedEmail, true);
        return subscription;
      } else {
        throw new NotFoundException('Подписка не найдена');
      }
    }

    if (subscription.isDelete) {
      return subscription;
    }

    await this.repository.delete(normalizedEmail);

    const updated =
      await this.repository.findByEmailIncludingDeleted(normalizedEmail);

    if (!updated) {
      throw new Error('Failed to delete subscription');
    }

    return updated;
  }
}
