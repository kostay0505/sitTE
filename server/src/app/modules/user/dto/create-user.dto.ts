import {
  IsString,
  IsOptional,
  IsEmail,
  IsUUID,
  IsBoolean
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  tgId: string;

  @IsOptional()
  @IsString()
  username?: string | null;

  @IsOptional()
  @IsString()
  firstName?: string | null;

  @IsOptional()
  @IsString()
  lastName?: string | null;

  @IsOptional()
  @IsString()
  photoUrl?: string | null;

  @IsOptional()
  @IsEmail()
  email?: string | null;

  @IsOptional()
  @IsString()
  phone?: string | null;

  @IsOptional()
  @IsUUID()
  cityId?: string | null;

  @IsOptional()
  @IsString()
  langCode?: string | null;

  @IsOptional()
  @IsString()
  invitedBy?: string | null;

  @IsOptional()
  @IsBoolean()
  subscribedToNewsletter?: boolean;

  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;

  @IsOptional()
  @IsString()
  passwordHash?: string | null;

  @IsOptional()
  @IsString()
  emailVerificationCode?: string | null;

  @IsOptional()
  @IsString()
  resetPasswordCode?: string | null;
}
