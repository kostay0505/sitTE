import { Module, forwardRef } from '@nestjs/common';
import { HrefService } from './href.service';
import { TelegramBotModule } from '../../modules/telegram/telegram.bots.module';

@Module({
  imports: [forwardRef(() => TelegramBotModule)],
  providers: [HrefService],
  exports: [HrefService]
})
export class HrefModule {} 