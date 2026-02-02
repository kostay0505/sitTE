import {
    Controller,
    Get,
    HttpCode,
    HttpStatus
} from '@nestjs/common';
import { StatsService } from './stats.service';
import { AdminJwtAuth } from '../../decorators/admin-jwt-auth.decorator';
import { Stats } from './types/stats.type';

@Controller('stats')
export class StatsController {
    constructor(private readonly service: StatsService) { }

    @Get()
    @AdminJwtAuth()
    @HttpCode(HttpStatus.OK)
    async getStats(): Promise<Stats> {
        return this.service.getStats();
    }
}
