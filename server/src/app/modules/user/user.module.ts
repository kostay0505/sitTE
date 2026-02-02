import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { CityModule } from '../city/city.module';
import { UserRepository } from './user.repository';
import { HrefModule } from '../../services/href/href.module';
import { MailModule } from '../../services/mail/mail.module';
import { TelegramBotModule } from '../telegram/telegram.bots.module';

@Module({
  imports: [
    CityModule,
    forwardRef(() => HrefModule),
    MailModule,
    forwardRef(() => TelegramBotModule)
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService, UserRepository]
})
export class UsersModule {}
