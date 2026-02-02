import { Controller, Post } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private mailService: MailService) {}

  @Post('send')
  async send() {
    return this.mailService.sendMail({
      to: 'pavlov200145@gmail.com',
      subject: 'Test Email',
      text: 'Hello, this is a test message'
    });
  }
}
