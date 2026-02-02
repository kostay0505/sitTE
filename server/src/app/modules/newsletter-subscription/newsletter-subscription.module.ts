import { Module } from '@nestjs/common';
import { NewsletterSubscriptionController } from './newsletter-subscription.controller';
import { NewsletterSubscriptionService } from './newsletter-subscription.service';
import { NewsletterSubscriptionRepository } from './newsletter-subscription.repository';

@Module({
  controllers: [NewsletterSubscriptionController],
  providers: [NewsletterSubscriptionService, NewsletterSubscriptionRepository],
  exports: [NewsletterSubscriptionService, NewsletterSubscriptionRepository],
})
export class NewsletterSubscriptionModule {}

