import { forwardRef, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TelegramBot } from './telegram.bot';
import { TelegramController } from './telegram.controller';
import { UsersModule } from '../user/user.module';
import { ProductModule } from '../product/product.module';
import { BroadcastService } from './broadcast/broadcast.service';
import { BroadcastProcessor } from './broadcast/broadcast.processor';
import { BROADCAST_CONFIG } from './broadcast/broadcast.config';
import { BroadcastHandler } from './broadcast/broadcast.handler';
import { ModerationService } from './moderation/moderation.service';
import { BrandModule } from '../brand/brand.module';
import { MailModule } from '../../services/mail/mail.module';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    forwardRef(() => ProductModule),
    forwardRef(() => BrandModule),
    forwardRef(() => ProductModule),
    MailModule,
    BullModule.registerQueue({
      name: 'broadcast',
      defaultJobOptions: {
        removeOnComplete: BROADCAST_CONFIG.REMOVE_ON_COMPLETE,
        removeOnFail: BROADCAST_CONFIG.REMOVE_ON_FAIL,
        attempts: BROADCAST_CONFIG.MAX_ATTEMPTS,
        backoff: {
          type: 'exponential',
          delay: BROADCAST_CONFIG.BACKOFF_DELAY
        }
      },
      settings: {
        stalledInterval: BROADCAST_CONFIG.STALLED_INTERVAL,
        maxStalledCount: BROADCAST_CONFIG.MAX_STALLED_COUNT
      }
    })
  ],
  controllers: [TelegramController],
  providers: [
    TelegramBot,
    ModerationService,
    BroadcastHandler,
    BroadcastService,
    BroadcastProcessor
  ],
  exports: [TelegramBot, ModerationService]
})
export class TelegramBotModule {}
