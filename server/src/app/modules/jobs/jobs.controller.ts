import { Controller, Get, Query } from '@nestjs/common';
import { JobsService, Job } from './jobs.service';
import { GetJobsDto } from './dto/get-jobs.dto';

@Controller('jobs')
export class JobsController {
    constructor(private readonly service: JobsService) { }

    @Get('available')
    async findAllAvailable(@Query() query: GetJobsDto): Promise<Job[]> {
        return this.service.findAllAvailable(query);
    }
}
