import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class MergeAccountsDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

