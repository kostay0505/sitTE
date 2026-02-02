import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { NewsletterSubscriptionService } from './newsletter-subscription.service';
import { CreateNewsletterSubscriptionDto } from './dto/create-newsletter-subscription.dto';
import { AdminJwtAuth } from '../../decorators/admin-jwt-auth.decorator';
import { type NewsletterSubscription } from './schemas/newsletter-subscriptions';

@Controller('newsletter-subscriptions')
export class NewsletterSubscriptionController {
  constructor(private readonly service: NewsletterSubscriptionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async subscribe(
    @Body() dto: CreateNewsletterSubscriptionDto
  ): Promise<{ message: string }> {
    return this.service.subscribe(dto);
  }

  @Get()
  @AdminJwtAuth()
  async findAll(): Promise<NewsletterSubscription[]> {
    return this.service.findAll();
  }

  @Put(':email/toggle-status')
  @AdminJwtAuth()
  @HttpCode(HttpStatus.OK)
  async toggleStatus(
    @Param('email') email: string
  ): Promise<NewsletterSubscription> {
    return this.service.toggleStatus(decodeURIComponent(email));
  }

  @Delete(':email')
  @AdminJwtAuth()
  @HttpCode(HttpStatus.OK)
  async delete(@Param('email') email: string): Promise<NewsletterSubscription> {
    return this.service.delete(decodeURIComponent(email));
  }
}
