import { Module } from '@nestjs/common';
import { forwardRef } from '@nestjs/common';
import { ManagerSync } from './manager.sync';
import { JobSync } from './job.sync';
import { AuthModule } from '../modules/auth/auth.module';
import { UsersModule } from '../modules/user/user.module';
import { TelegramBotModule } from '../modules/telegram/telegram.bots.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    forwardRef(() => TelegramBotModule),
  ],
  providers: [
    ManagerSync,
    JobSync,
  ],
  exports: [
    ManagerSync,
    JobSync,
  ]
})
export class SyncsModule { } 