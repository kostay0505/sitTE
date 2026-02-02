import { Injectable, Logger, Inject } from '@nestjs/common';
import { Mutex } from 'async-mutex';
import { lt, and, eq } from 'drizzle-orm';
import { Database } from '../../database/schema';
import { vacancies } from '../modules/vacancy/schemas/vacancies';
import { resumes } from '../modules/resume/schemas/resumes';

@Injectable()
export class JobSync {
    private readonly logger = new Logger(JobSync.name);
    private readonly mutex = new Mutex();

    private readonly DEACTIVATION_PERIOD_MS = 14 * 24 * 60 * 60 * 1000;

    constructor(
        @Inject('DATABASE') private readonly db: Database,
    ) {
    }

    async deleteExpiredVacanciesAndResumes(): Promise<void> {
        await this.mutex.runExclusive(async () => {
            try {
                this.logger.log('Начинаем деактивацию просроченных резюме и вакансий');

                const cutoffDate = new Date(Date.now() - this.DEACTIVATION_PERIOD_MS);

                // Деактивируем просроченные вакансии
                const deactivatedVacancies = await this.deactivateExpiredVacancies(cutoffDate);

                // Деактивируем просроченные резюме
                const deactivatedResumes = await this.deactivateExpiredResumes(cutoffDate);

                this.logger.log(`Деактивация завершена. Деактивировано вакансий: ${deactivatedVacancies}, резюме: ${deactivatedResumes}`);
            } catch (error) {
                this.logger.error(`Ошибка при деактивации просроченных резюме и вакансий: ${error.message}`, error.stack);
            }
        });
    }

    private async deactivateExpiredVacancies(cutoffDate: Date): Promise<number> {
        try {
            // Сначала получаем количество активных записей для деактивации
            const expiredVacancies = await this.db.select({ id: vacancies.id })
                .from(vacancies)
                .where(
                    and(
                        lt(vacancies.updatedAt, cutoffDate),
                        eq(vacancies.isActive, true)
                    )
                );

            if (expiredVacancies.length === 0) {
                this.logger.log('Нет просроченных вакансий для деактивации');
                return 0;
            }

            // Деактивируем только активные записи
            await this.db.update(vacancies)
                .set({ isActive: false })
                .where(
                    and(
                        lt(vacancies.updatedAt, cutoffDate),
                        eq(vacancies.isActive, true)
                    )
                );

            this.logger.log(`Деактивировано ${expiredVacancies.length} просроченных вакансий`);
            return expiredVacancies.length;
        } catch (error) {
            this.logger.error(`Ошибка при деактивации просроченных вакансий: ${error.message}`, error.stack);
            return 0;
        }
    }

    private async deactivateExpiredResumes(cutoffDate: Date): Promise<number> {
        try {
            // Сначала получаем количество активных записей для деактивации
            const expiredResumes = await this.db.select({ id: resumes.id })
                .from(resumes)
                .where(
                    and(
                        lt(resumes.updatedAt, cutoffDate),
                        eq(resumes.isActive, true)
                    )
                );

            if (expiredResumes.length === 0) {
                this.logger.log('Нет просроченных резюме для деактивации');
                return 0;
            }

            // Деактивируем только активные записи
            await this.db.update(resumes)
                .set({ isActive: false })
                .where(
                    and(
                        lt(resumes.updatedAt, cutoffDate),
                        eq(resumes.isActive, true)
                    )
                );

            this.logger.log(`Деактивировано ${expiredResumes.length} просроченных резюме`);
            return expiredResumes.length;
        } catch (error) {
            this.logger.error(`Ошибка при деактивации просроченных резюме: ${error.message}`, error.stack);
            return 0;
        }
    }
} 