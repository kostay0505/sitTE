import { Injectable, ExecutionContext } from '@nestjs/common';
import {
  ThrottlerGuard,
  ThrottlerException,
} from '@nestjs/throttler';
import { Request } from 'express';

@Injectable()
export class CodeAttemptThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Request): Promise<string> {
    const email = (req.body?.email as string)?.toLowerCase()?.trim();
    if (!email) {
      return super.getTracker(req);
    }
    return `code-attempt:${email}`;
  }

  protected async throwThrottlingException(
  ): Promise<void> {
    throw new ThrottlerException(
      'Вы превысили количество попыток ввода кода. Попробуйте позже или запросите новый код.'
    );
  }
}
