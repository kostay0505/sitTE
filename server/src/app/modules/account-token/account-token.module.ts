import { Module } from '@nestjs/common';
import { AccountTokenService } from './account-token.service';
import { AccountTokenRepository } from './account-token.repository';

@Module({
  controllers: [],
  providers: [AccountTokenService, AccountTokenRepository],
  exports: [AccountTokenService, AccountTokenRepository],
})
export class AccountTokenModule { } 