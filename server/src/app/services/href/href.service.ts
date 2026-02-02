import { Injectable, Inject, forwardRef, Logger } from '@nestjs/common';
import { TelegramBot } from '../../modules/telegram/telegram.bot';
import { BOT_COMMANDS } from 'src/app/modules/telegram/bot.commands';
import * as crypto from 'crypto';

type unitType = 'product' | 'brand' | 'seller';

@Injectable()
export class HrefService {
  private readonly logger = new Logger(HrefService.name);

  constructor(
    @Inject(forwardRef(() => TelegramBot))
    private readonly telegramBot: TelegramBot
  ) {}

  private encodeShortId(id: string): string {
    if (id.startsWith('email:')) {
      const uuid = id.replace('email:', '');
      const hash = crypto.createHash('sha256').update(uuid).digest('hex');
      return hash.substring(0, 12);
    }
    return id;
  }

  async generateShareLink(id: string, type: unitType): Promise<string> {
    const botUsername = (await this.telegramBot.getBotInfo()).username;
    let url = '';
    switch (type) {
      case 'product':
        url = `https://t.me/${botUsername}?start=${BOT_COMMANDS.SHARE_PRODUCT}${id}`;
        break;
      case 'brand':
        url = `https://t.me/${botUsername}?start=${BOT_COMMANDS.SHARE_BRAND}${id}`;
        break;
      case 'seller':
        const shortId = this.encodeShortId(id);
        url = `https://t.me/${botUsername}?start=${BOT_COMMANDS.SHARE_SELLER}${shortId}`;
        break;
    }
    return url;
  }

  async generateReferralLink(): Promise<string> {
    const botUsername = (await this.telegramBot.getBotInfo()).username;
    return botUsername;
  }
}
