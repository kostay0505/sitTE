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
import { VacancyService } from './vacancy.service';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { AdminCreateVacancyDto } from './dto/admin-create-vacancy.dto';
import { AdminUpdateVacancyDto } from './dto/admin-update-vacancy.dto';
import { GetVacanciesDto } from './dto/get-vacancies.dto';
import { ActivateVacancyDto } from './dto/activate-vacancy.dto';
import { DeleteVacancyDto } from './dto/delete-vacancy.dto';
import { JwtAuth } from '../../decorators/jwt-auth.decorator';
import { type Vacancy } from './schemas/vacancies';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { AdminJwtAuth } from 'src/app/decorators/admin-jwt-auth.decorator';

@Controller('vacancies')
export class VacancyController {
    constructor(private readonly service: VacancyService) { }

    @Get('available')
    async findAllAvailable(@Query() query: GetVacanciesDto): Promise<Vacancy[]> {
        return this.service.findAllAvailable(query);
    }

    @Get('my')
    @JwtAuth()
    async findAllMy(@Request() req: RequestWithUser): Promise<Vacancy[]> {
        return this.service.findAllMy(req.user.tgId);
    }

    @Get()
    @AdminJwtAuth()
    async findAll(): Promise<Vacancy[]> {
        return this.service.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Vacancy> {
        const vacancy = await this.service.findById(id);
        if (!vacancy) {
            throw new Error('Вакансия не найдена');
        }
        return vacancy;
    }

    @Post()
    @JwtAuth()
    @HttpCode(HttpStatus.CREATED)
    async create(
        @Request() req: RequestWithUser,
        @Body() dto: CreateVacancyDto
    ): Promise<Vacancy> {
        return this.service.create(req.user.tgId, dto);
    }

    @Put(':id')
    @JwtAuth()
    @HttpCode(HttpStatus.OK)
    async update(
        @Request() req: RequestWithUser,
        @Param('id') id: string,
        @Body() dto: UpdateVacancyDto
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
        @Body() dto: DeleteVacancyDto
    ): Promise<boolean> {
        return this.service.delete(req.user.tgId, dto.id);
    }

    @Post('admin')
    @AdminJwtAuth()
    @HttpCode(HttpStatus.CREATED)
    async adminCreate(
        @Body() dto: AdminCreateVacancyDto
    ): Promise<Vacancy> {
        return this.service.adminCreate(dto);
    }

    @Put('admin')
    @AdminJwtAuth()
    @HttpCode(HttpStatus.OK)
    async adminUpdate(
        @Body() dto: AdminUpdateVacancyDto
    ): Promise<boolean> {
        return this.service.adminUpdate(dto);
    }
}
