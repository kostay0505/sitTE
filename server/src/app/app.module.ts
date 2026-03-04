import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { Logger } from './classes/logger';
import { UsersModule } from './modules/user/user.module';
import { TelegramBotModule } from './modules/telegram/telegram.bots.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './modules/auth/auth.module';
import { AccountModule } from './modules/account/account.module';
import { AccountTokenModule } from './modules/account-token/account-token.module';
import { RefreshTokenModule } from './modules/refresh-token/refresh-token.module';
import { DatabaseModule } from '../database/database.module';
import { FavoriteProductModule } from './modules/favorite-product/favorite-product.module';
import { ProductModule } from './modules/product/product.module';
import { ResumeModule } from './modules/resume/resume.module';
import { VacancyModule } from './modules/vacancy/vacancy.module';
import { ViewedProductModule } from './modules/viewed-product/viewed-product.module';
import { BrandModule } from './modules/brand/brand.module';
import { CategoryModule } from './modules/category/category.module';
import { CityModule } from './modules/city/city.module';
import { CountryModule } from './modules/country/country.module';
import { StatsModule } from './modules/stats/stats.module';
import { FilesModule } from './services/files/files.module';
import { SyncsModule } from './syncs/syncs.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { MailModule } from './services/mail/mail.module';
import { NewsletterSubscriptionModule } from './modules/newsletter-subscription/newsletter-subscription.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ChatModule } from './modules/chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true
    }),
    DatabaseModule,
    BullModule.forRootAsync({
      useFactory: () => ({
        redis: {
          host: 'localhost',
          port: 6379
        }
      })
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 1000 * 60 * 10,
          limit: 100
        }
      ]
    }),
    ScheduleModule.forRoot(),
    FilesModule,
    TelegramBotModule,
    AccountModule,
    AccountTokenModule,
    RefreshTokenModule,
    AuthModule,
    UsersModule,
    BrandModule,
    CategoryModule,
    CityModule,
    CountryModule,
    StatsModule,
    SyncsModule,
    FavoriteProductModule,
    ProductModule,
    ResumeModule,
    VacancyModule,
    ViewedProductModule,
    JobsModule,
    MailModule,
    NewsletterSubscriptionModule,
    ChatModule,
  ],
  controllers: [],
  providers: [Logger]
})
export class AppModule {}
