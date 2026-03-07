import {
  Controller,
  Get,
  Put,
  Body,
  Request,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BusinessPageService } from './business-page.service';
import { JwtAuth } from '../../decorators/jwt-auth.decorator';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';

@Controller('business-page')
export class BusinessPageController {
  constructor(private readonly service: BusinessPageService) {}

  @Get('my')
  @JwtAuth()
  async getMy(@Request() req: RequestWithUser) {
    return this.service.getMyPage(req.user.tgId);
  }

  @Put()
  @JwtAuth()
  @HttpCode(HttpStatus.OK)
  async upsert(
    @Request() req: RequestWithUser,
    @Body('slug') slug: string,
    @Body('blocks') blocks: any[],
  ) {
    return this.service.upsert(req.user.tgId, slug, blocks ?? []);
  }

  @Get('user/:userId')
  async getByUserId(@Param('userId') userId: string) {
    return this.service.getSlugByUserId(userId);
  }

  @Get(':slug')
  async getBySlug(@Param('slug') slug: string) {
    return this.service.getBySlug(slug);
  }
}
