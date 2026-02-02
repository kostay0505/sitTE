import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateNewsletterSubscriptionDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

