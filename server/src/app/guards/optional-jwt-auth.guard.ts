import { applyDecorators, UseGuards } from '@nestjs/common';
import { OptionalJwtAuthGuard } from '../decorators/optional-jwt-auth.decorator';

export function OptionalJwtAuth() {
  return applyDecorators(UseGuards(OptionalJwtAuthGuard));
}
