import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { JobSync } from './job.sync';
import { Mutex } from 'async-mutex';

@Injectable()
export class ManagerSync {
  private readonly logger = new Logger(ManagerSync.name);

  // Используем отдельные мьютексы для каждого интервала
  private readonly mutex4Hours = new Mutex();

  // Таймауты для различных типов задач
  private readonly TIMEOUT_4HOURS = 60 * 60 * 1000; // 1 час для 4-часовых задач

  constructor(
    private readonly jobSync: JobSync,
  ) { }

  @Cron(CronExpression.EVERY_4_HOURS)
  async syncEvery4Hours(): Promise<void> {
    const release = await this.mutex4Hours.acquire();
    const startTime = Date.now();

    try {
      this.logger.log('Начало 4-часовой синхронизации');

      await this.executeWithTimeout(async () => {
        await this.executeWithLogging('deleteExpiredVacanciesAndResumes', () => this.jobSync.deleteExpiredVacanciesAndResumes());
      }, this.TIMEOUT_4HOURS, '4-часовая синхронизация');

      const duration = Date.now() - startTime;
      this.logger.log(`4-часовая синхронизация завершена за ${duration}ms`);
    } catch (error) {
      this.logger.error(`Критическая ошибка в syncEvery4Hours: ${error.message}. Stack: ${error.stack}`);
    } finally {
      release();
    }
  }

  /**
   * Выполняет функцию с логированием и обработкой ошибок
   */
  private async executeWithLogging(taskName: string, taskFn: () => Promise<void>): Promise<void> {
    try {
      const startTime = Date.now();
      await taskFn();
      const duration = Date.now() - startTime;
      this.logger.log(`Задача ${taskName} выполнена за ${duration}ms`);
    } catch (error) {
      this.logger.error(`Ошибка при выполнении задачи ${taskName}: ${error.message}. Stack: ${error.stack}`);
    }
  }

  /**
   * Выполняет функцию с таймаутом для предотвращения зависания
   */
  private async executeWithTimeout<T>(
    taskFn: () => Promise<T>,
    timeoutMs: number,
    taskName: string
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Таймаут выполнения задачи "${taskName}" (${timeoutMs}ms)`));
      }, timeoutMs);

      taskFn()
        .then(result => {
          clearTimeout(timeout);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timeout);
          reject(error);
        });
    });
  }

  /**
   * Получает статус выполнения всех синхронизаций
   */
  getStatus(): {
    is4HoursRunning: boolean;
  } {
    return {
      is4HoursRunning: this.mutex4Hours.isLocked(),
    };
  }
}
