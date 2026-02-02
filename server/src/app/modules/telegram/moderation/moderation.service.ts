import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { Product } from '../../product/schemas/products';
import { InlineKeyboard } from 'grammy';
import { BOT_COMMANDS } from '../bot.commands';
import { TelegramBot } from '../telegram.bot';
import { UserService } from '../../user/user.service';
import { ProductService } from '../../product/product.service';
import { ProductStatus } from '../../product/types/enums';
import { MailService } from '../../../services/mail/mail.service';

@Injectable()
export class ModerationService {
  private readonly logger = new Logger(ModerationService.name);

  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => ProductService))
    private readonly productService: ProductService,
    @Inject(forwardRef(() => TelegramBot))
    private readonly telegramBot: TelegramBot,
    private readonly mailService: MailService
  ) { }

  async approveProduct(productId: string): Promise<boolean> {
    const product = await this.productService.approveProduct(productId);

    await this.sendUserNotification(product, ProductStatus.APPROVED);

    return true;
  }

  async rejectProduct(productId: string): Promise<boolean> {
    const product = await this.productService.rejectProduct(productId);

    await this.sendUserNotification(product, ProductStatus.REJECTED);

    return true;
  }

  async sendModerationNotification(
    product: Product,
    action: 'create' | 'update'
  ): Promise<void> {
    try {
      const actionText = action === 'create' ? 'создано' : 'обновлено';
      const user = await this.userService.findShortByTgId(
        product.user?.tgId || ''
      );

      const message =
        `🆕 Новое объявление на модерацию!\n\n` +
        `Название: ${product.name}\n` +
        `Цена: ${product.priceCash} ${product.currency}\n` +
        `Пользователь: ${user?.firstName || 'Неизвестно'}\n` +
        `Действие: ${actionText}\n\n` +
        `ID: ${product.id}`;

      const keyboard = new InlineKeyboard()
        .text('✅ Одобрить', `${BOT_COMMANDS.APPROVE_PRODUCT}_${product.id}`)
        .text('❌ Отклонить', `${BOT_COMMANDS.REJECT_PRODUCT}_${product.id}`);

      await this.telegramBot
        .getBotApi()
        .sendMessage(this.telegramBot.chatId, message, {
          reply_markup: keyboard
        });
    } catch (error) {
      this.logger.error(`Ошибка при отправке уведомления о модерации: ${error.stack}`);
    }
  }

  async sendUserNotification(
    product: Product,
    status: ProductStatus,
    reason?: string
  ): Promise<void> {
    try {
      const user = await this.userService.findByTgId(product.user?.tgId || '');

      if (!user) {
        return;
      }

      let message = '';
      let subject = '';
      let htmlContent = '';

      if (status === ProductStatus.APPROVED) {
        message =
          `✅ Ваше объявление "${product.name}" одобрено!\n\n` +
          `Теперь оно доступно для просмотра всем пользователям.`;
        subject = 'Ваше объявление одобрено';
        htmlContent = `
          <p>✅ Ваше объявление "<b>${product.name}</b>" одобрено!</p>
          <p style="margin-top: 12px;">Теперь оно доступно для просмотра всем пользователям.</p>
        `;
      } else {
        message = `❌ Ваше объявление "${product.name}" отклонено.\n\n`;
        subject = 'Ваше объявление отклонено';
        if (reason) {
          message += `Причина: ${reason}`;
          htmlContent = `
            <p>❌ Ваше объявление "<b>${product.name}</b>" отклонено.</p>
            <p style="margin-top: 12px;"><b>Причина:</b> ${reason}</p>
          `;
        } else {
          message += `Пожалуйста, обновите объявление и попробуйте снова.`;
          htmlContent = `
            <p>❌ Ваше объявление "<b>${product.name}</b>" отклонено.</p>
            <p style="margin-top: 12px;">Пожалуйста, обновите объявление и попробуйте снова.</p>
          `;
        }
      }

      if (user.username && user.tgId) {
        await this.telegramBot.getBotApi().sendMessage(user.tgId, message);
      } else if (user.email) {
        await this.sendEmailNotification(user.email, subject, htmlContent);
      }
    } catch (error) {
      this.logger.error(`Ошибка при отправке уведомления пользователю: ${error.stack}`);
    }
  }

  private async sendEmailNotification(
    email: string,
    subject: string,
    htmlContent: string
  ): Promise<void> {
    const html = this.mailService.wrapTemplate(subject, htmlContent);
    await this.mailService.sendMail({
      to: email,
      subject: `${subject} - Touring Expert`,
      html
    });
  }
}
