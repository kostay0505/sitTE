import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

export interface SendMailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    const hasCredentials =
      process.env.EMAIL_USER &&
      process.env.EMAIL_PASSWORD &&
      process.env.EMAIL_HOST &&
      process.env.EMAIL_PORT &&
      process.env.EMAIL_SECURE;

    if (!hasCredentials) {
      this.logger.warn('SMTP credentials are missing — email sending is disabled');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async sendMail(options: SendMailOptions) {
    if (!this.transporter) {
      this.logger.warn(`Email skipped (no SMTP): ${options.subject} -> ${options.to}`);
      return { success: false, skipped: true };
    }
    try {
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM ?? process.env.EMAIL_USER,
        ...options
      });
      return { success: true, messageId: info.messageId };
    } catch (error) {
      this.logger.error(`Email error: ${error.stack}`);
      throw new InternalServerErrorException('Failed to send email');
    }
  }

    async sendEmailVerification(email: string, code: string) {
    const html = this.wrapTemplate(
      'Подтверждение email',
      `
      <p>Ваш код подтверждения:</p>

      <div style="
        font-size: 36px;
        font-weight: bold;
        color: #005eff;
        margin: 16px 0;
        letter-spacing: 4px;
      ">
        ${code}
      </div>

      <p style="margin-top: 12px;">
        Срок действия — <b>10 минут</b>.
      </p>
      <p style="color:#555;">Если вы не запрашивали код, просто игнорируйте это письмо.</p>
    `
    );
    return this.sendMail({
      to: email,
      subject: 'Код подтверждения Touring Expert',
      html
    });
  }

  async sendResetPassword(email: string, code: string) {
    const html = this.wrapTemplate(
      'Восстановление пароля',
      `
      <p>Ваш код восстановления:</p>

      <div style="
        font-size: 36px;
        font-weight: bold;
        color: #ff4b4b;
        margin: 16px 0;
        letter-spacing: 4px;
      ">
        ${code}
      </div>

      <p style="margin-top: 12px;">
        Код действует <b>10 минут</b>.
      </p>
      <p style="color:#555;">Если вы не запрашивали восстановление пароля, проигнорируйте письмо.</p>
    `
    );
    return this.sendMail({
      to: email,
      subject: 'Восстановление пароля Touring Expert',
      html
    });
  }

  async sendWelcome(email: string, username?: string) {
    const html = this.wrapTemplate(
      'Добро пожаловать!',
      `
      <p>
        Здравствуйте${username ? ', <b>' + username + '</b>' : ''}!
      </p>

      <p style="margin-top: 12px;">
        Спасибо за регистрацию в сервисе <b>Touring Expert</b>.
      </p>

      <p style="
        margin-top: 18px;
        font-size: 15px;
        color:#555;
      ">
        Мы рады видеть вас среди наших пользователей 🚀
      </p>
    `
    );
    return this.sendMail({
      to: email,
      subject: 'Добро пожаловать! Touring Expert',
      html
    });
  }

  wrapTemplate(title: string, content: string) {
    return `
  <div style="
    width: 100%;
    background: #f5f5f5;
    padding: 40px 0;
    font-family: Arial, sans-serif;
  ">
    <div style="
      max-width: 480px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 12px;
      padding: 32px 28px;
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.07);
      text-align: center;
    ">
      <h2 style="
        margin-bottom: 16px;
        font-size: 22px;
        font-weight: 600;
        color: #1a1a1a;
      ">
        ${title}
      </h2>

      <div style="
        font-size: 16px;
        color: #333;
        line-height: 1.5;
      ">
        ${content}
      </div>

    </div>
  </div>
  `;
  }
}
