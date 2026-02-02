import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    HttpCode,
    HttpStatus,
    Request
} from '@nestjs/common';
import { ResumeService } from './resume.service';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { AdminCreateResumeDto } from './dto/admin-create-resume.dto';
import { AdminUpdateResumeDto } from './dto/admin-update-resume.dto';
import { GetResumesDto } from './dto/get-resumes.dto';
import { DeleteResumeDto } from './dto/delete-resume.dto';
import { JwtAuth } from '../../decorators/jwt-auth.decorator';
import { type Resume } from './schemas/resumes';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { AdminJwtAuth } from 'src/app/decorators/admin-jwt-auth.decorator';

@Controller('resumes')
export class ResumeController {
    constructor(private readonly service: ResumeService) { }

    @Get('available')
    async findAllAvailable(@Query() query: GetResumesDto): Promise<Resume[]> {
        return this.service.findAllAvailable(query);
    }

    @Get('my')
    @JwtAuth()
    async findAllMy(@Request() req: RequestWithUser): Promise<Resume[]> {
        return this.service.findAllMy(req.user.tgId);
    }

    @Get()
    @AdminJwtAuth()
    async findAll(): Promise<Resume[]> {
        return this.service.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Resume> {
        const resume = await this.service.findById(id);
        if (!resume) {
            throw new Error('Резюме не найдено');
        }
        return resume;
    }

    @Post()
    @JwtAuth()
    @HttpCode(HttpStatus.CREATED)
    async create(
        @Request() req: RequestWithUser,
        @Body() dto: CreateResumeDto
    ): Promise<Resume> {
        return this.service.create(req.user.tgId, dto);
    }

    @Put(':id')
    @JwtAuth()
    @HttpCode(HttpStatus.OK)
    async update(
        @Request() req: RequestWithUser,
        @Param('id') id: string,
        @Body() dto: UpdateResumeDto
    ): Promise<boolean> {
        return this.service.update(req.user.tgId, id, dto);
    }

    @Put('toggle-activate/:id')
    @JwtAuth()
    @HttpCode(HttpStatus.OK)
    async toggleActivate(
        @Request() req: RequestWithUser,
        @Param('id') id: string
    ): Promise<boolean> {
        return this.service.toggleActivate(req.user.tgId, id);
    }

    @Delete()
    @JwtAuth()
    @HttpCode(HttpStatus.OK)
    async delete(
        @Request() req: RequestWithUser,
        @Body() dto: DeleteResumeDto
    ): Promise<boolean> {
        return this.service.delete(req.user.tgId, dto.id);
    }

    @Post('admin')
    @AdminJwtAuth()
    @HttpCode(HttpStatus.CREATED)
    async adminCreate(
        @Body() dto: AdminCreateResumeDto
    ): Promise<Resume> {
        return this.service.adminCreate(dto);
    }

    @Put('admin/:id')
    @AdminJwtAuth()
    @HttpCode(HttpStatus.OK)
    async adminUpdate(
        @Param('id') id: string,
        @Body() dto: AdminUpdateResumeDto
    ): Promise<boolean> {
        return this.service.adminUpdate(id, dto);
    }
}
