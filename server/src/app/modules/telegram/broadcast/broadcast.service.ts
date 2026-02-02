import { forwardRef, Inject, Injectable, Logger } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";
import { Job, Queue } from "bull";
import { Message } from "grammy/types";
import { BROADCAST_CONFIG } from "./broadcast.config";
import { BroadcastJob, BroadcastReport, BroadcastButton, ParsedBroadcastMessage } from "./types";
import { TelegramBot } from "../telegram.bot";
import * as fs from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import * as path from 'path';
import { Helper } from "../../../classes/helper";
import { UserService } from "../../user/user.service";

@Injectable()
export class BroadcastService {
    private readonly logger = new Logger(BroadcastService.name);
    private readonly reportsDir = path.join(process.cwd(), 'broadcast-reports');
    public readonly broadcastReports = new Map<string, BroadcastReport>();

    private static readonly BUTTON_REGEX = /\[(\{.*?\}(?:\s*,\s*\{.*?\})*)\]\s*$/s;

    constructor(
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
        @InjectQueue('broadcast') private readonly queue: Queue<BroadcastJob>,
        @Inject(forwardRef(() => TelegramBot))
        private readonly telegramBot: TelegramBot,
    ) {
        if (!existsSync(this.reportsDir)) {
            mkdirSync(this.reportsDir, { recursive: true });
        }
        this.listenToQueueEvents();
    }

    private parseMessageForButtons(message: Message): ParsedBroadcastMessage {
        if (!message.text && !message.caption) {
            return { cleanMessage: '', buttons: [] };
        }

        const text = message.text || message.caption || '';
        const isCaption = !message.text && !!message.caption;

        const match = text.match(BroadcastService.BUTTON_REGEX);

        if (!match) {
            return {
                cleanMessage: text,
                buttons: [],
                entities: isCaption ? undefined : message.entities,
                captionEntities: isCaption ? message.caption_entities : undefined
            };
        }

        try {
            let buttonsJson = `[${match[1]}]`;

            if (!/([{,]\s*)"\w+":/g.test(buttonsJson)) {
                // Если ключи не в кавычках, добавляем кавычки
                buttonsJson = buttonsJson.replace(/([{,]\s*)(\w+):/g, '$1"$2":');
            }

            const buttons: BroadcastButton[] = JSON.parse(buttonsJson);

            // Валидация структуры кнопок
            const validButtons = buttons.filter(btn =>
                btn && typeof btn.button === 'string' && typeof btn.link === 'string'
            );

            const cleanMessage = text.replace(BroadcastService.BUTTON_REGEX, '').trim();

            // Фильтруем entities которые находятся в пределах чистого сообщения
            const cleanMessageLength = cleanMessage.length;
            const originalEntities = isCaption ? message.caption_entities : message.entities;
            const filteredEntities = originalEntities?.filter(entity =>
                entity.offset + entity.length <= cleanMessageLength
            );

            return {
                cleanMessage,
                buttons: validButtons,
                entities: isCaption ? undefined : filteredEntities,
                captionEntities: isCaption ? filteredEntities : undefined
            };
        } catch (error) {
            this.logger.warn(`Failed to parse buttons from message: ${error.message}, text: "${text}"`);
            return {
                cleanMessage: text,
                buttons: [],
                entities: isCaption ? undefined : message.entities,
                captionEntities: isCaption ? message.caption_entities : undefined
            };
        }
    }

    private listenToQueueEvents(): void {
        this.queue.on('completed', (job: Job<BroadcastJob>, result: 'sent' | 'blocked' | 'retry_scheduled') => {
            const { broadcastId, retryCount } = job.data;
            const report = this.broadcastReports.get(broadcastId);
            if (!report) return;

            if (result === 'sent') {
                report.sent++;
                // Если это было retry задание, уменьшаем счетчик retrying
                if (retryCount && retryCount > 0) {
                    report.retrying = Math.max(0, (report.retrying || 0) - 1);
                }
            } else if (result === 'blocked') {
                report.blocked++;
                // Если это было retry задание, уменьшаем счетчик retrying
                if (retryCount && retryCount > 0) {
                    report.retrying = Math.max(0, (report.retrying || 0) - 1);
                }
            } else if (result === 'retry_scheduled') {
                report.retrying = (report.retrying || 0) + 1;
                return; // Не проверяем прогресс для retry_scheduled
            }

            this.checkProgress(report, broadcastId);
        });

        this.queue.on('failed', (job: Job<BroadcastJob>, error: Error) => {
            const { broadcastId, tgId, retryCount } = job.data;
            const report = this.broadcastReports.get(broadcastId);
            if (!report) return;

            report.failed++;
            report.errors.push({ tgId, error: error.message });

            // Если это было retry задание, уменьшаем счетчик retrying
            if (retryCount && retryCount > 0) {
                report.retrying = Math.max(0, (report.retrying || 0) - 1);
            }

            this.checkProgress(report, broadcastId);
        });
    }

    private async checkProgress(report: BroadcastReport, broadcastId: string): Promise<void> {
        const processed = report.sent + report.failed + report.blocked;
        const activeRetries = report.retrying || 0;

        this.logger.debug(`Broadcast ${broadcastId} progress: processed=${processed}/${report.total}, active_retries=${activeRetries}, sent=${report.sent}, failed=${report.failed}, blocked=${report.blocked}`);

        if (processed > 0 && processed % 1000 === 0 && processed < report.total) {
            this.sendProgressUpdate(report);
        }

        // Финализируем только когда все задачи обработаны И нет активных retry
        if (processed === report.total && activeRetries === 0) {
            this.logger.log(`All tasks completed for broadcast ${broadcastId}, finalizing...`);
            await this.finalizeBroadcast(report, broadcastId);
        } else if (processed === report.total && activeRetries > 0) {
            this.logger.log(`Main tasks completed for broadcast ${broadcastId}, but ${activeRetries} retry tasks still active`);
            // Отправляем промежуточное уведомление один раз
            if (!report.mainTasksCompletedNotified) {
                await this.sendMainTasksCompletedNotification(report, activeRetries);
                report.mainTasksCompletedNotified = true;
            }
        }
    }

    private async sendMainTasksCompletedNotification(report: BroadcastReport, activeRetries: number): Promise<void> {
        const message = `📊 Основные задачи рассылки завершены
        
Отправлено: ${report.sent}
Заблокировано: ${report.blocked}
Ошибок: ${report.failed}
⏳ Ожидаем завершения повторных попыток: ${activeRetries}

Финальный отчет будет отправлен после завершения всех повторных попыток.`;

        try {
            await this.telegramBot.getBotApi().sendMessage(report.adminId, message);
        } catch (error) {
            this.logger.error(`Failed to send main tasks completed notification for broadcast to admin ${report.adminId}`, error);
        }
    }

    private async finalizeBroadcast(report: BroadcastReport, broadcastId: string): Promise<void> {
        report.status = 'completed';
        report.finishTime = Helper.getClearDateNow();

        const reportJson = JSON.stringify(report);
        const reportPath = path.join(this.reportsDir, `${broadcastId}.json`);

        try {
            await fs.writeFile(reportPath, reportJson);
            this.logger.log(`Broadcast report ${broadcastId} saved to ${reportPath}`);
        } catch (error) {
            this.logger.error(`Failed to save broadcast report ${broadcastId}`, error);
        }

        let message = `✅ Рассылка завершена.
        
Отправлено: ${report.sent}
Заблокировано: ${report.blocked}
Ошибок: ${report.failed}
Всего: ${report.total}`;

        if (report.retrying && report.retrying > 0) {
            message += `\n⏳ Было запланировано повторов: ${report.retrying}`;
        }

        try {
            await this.telegramBot.getBotApi().sendMessage(report.adminId, message);
        } catch (error) {
            this.logger.error(`Failed to send final report for broadcast ${broadcastId} to admin ${report.adminId}`, error);
        }

        this.broadcastReports.delete(broadcastId);
    }

    private sendProgressUpdate(report: BroadcastReport): void {
        const processed = report.sent + report.failed + report.blocked;
        let message = `📈 Прогресс рассылки:
        
Обработано: ${processed} / ${report.total}
Отправлено: ${report.sent}
Заблокировано: ${report.blocked}
Ошибок: ${report.failed}`;

        if (report.retrying && report.retrying > 0) {
            message += `\nОжидают повтора: ${report.retrying}`;
        }

        try {
            this.telegramBot.getBotApi().sendMessage(report.adminId, message);
        } catch (error) {
            this.logger.error(`Failed to send progress update for broadcast to admin ${report.adminId}`, error);
        }
    }

    async start(message: Message, broadcastId: string, adminId: number, userType: 'all'): Promise<BroadcastReport> {
        const report: BroadcastReport = {
            total: 0,
            sent: 0,
            failed: 0,
            blocked: 0,
            adminId,
            message,
            errors: [],
            startTime: Helper.getClearDateNow(),
            status: 'running',
            retrying: 0,
            mainTasksCompletedNotified: false,
        };
        this.broadcastReports.set(broadcastId, report);

        try {
            // Using a separate async task to not block the command response
            this.queueUsers(message, broadcastId, report, userType);
            return report;
        } catch (error) {
            this.logger.error(`Failed to start broadcast ${broadcastId}`, error);
            report.status = 'failed';
            throw error;
        }
    }

    private async queueUsers(message: Message, broadcastId: string, report: BroadcastReport, userType: 'all'): Promise<void> {
        let offset = 0;
        let totalQueued = 0;

        try {
            const parsedMessage = this.parseMessageForButtons(message);

            for (; ;) {
                let tgIds = await this.userService.getIdsForBroadcastBatch(offset, BROADCAST_CONFIG.BATCH_SIZE);
                if (!tgIds.length) break;

                await this.queue.addBulk(
                    tgIds.map((tgId: string) => ({
                        name: 'send',
                        data: {
                            tgId,
                            payload: message,
                            parsedMessage,
                            broadcastId,
                            adminId: report.adminId
                        },
                    })),
                );

                totalQueued += tgIds.length;
                offset += BROADCAST_CONFIG.BATCH_SIZE;

                this.logger.log(`Queued batch of ${tgIds.length} users for broadcast ${broadcastId} (total: ${totalQueued})`);
            }

            report.total = totalQueued;

            if (totalQueued === 0) {
                await this.finalizeBroadcast(report, broadcastId);
            }
        } catch (error) {
            this.logger.error(`Failed during user queuing for broadcast ${broadcastId}`, error);
            report.status = 'failed';
        }
    }

    async getQueueStats(): Promise<{ waiting: number; active: number; completed: number; failed: number }> {
        const [waiting, active, completed, failed] = await Promise.all([
            this.queue.getWaiting(),
            this.queue.getActive(),
            this.queue.getCompleted(),
            this.queue.getFailed(),
        ]);

        return {
            waiting: waiting.length,
            active: active.length,
            completed: completed.length,
            failed: failed.length,
        };
    }

    async scheduleRetry(jobData: BroadcastJob, delayMs: number): Promise<void> {
        const { broadcastId } = jobData;

        try {
            await this.queue.add('send', jobData, {
                delay: delayMs,
                attempts: 1, // Для retry используем только одну попытку
                removeOnComplete: BROADCAST_CONFIG.REMOVE_ON_COMPLETE,
                removeOnFail: BROADCAST_CONFIG.REMOVE_ON_FAIL,
            });

            this.logger.log(`Scheduled retry for user ${jobData.tgId} in broadcast ${broadcastId} with delay ${delayMs}ms`);
        } catch (error) {
            this.logger.error(`Failed to schedule retry for user ${jobData.tgId} in broadcast ${broadcastId}`, error);
            // Если не удалось запланировать retry, отмечаем как ошибку
            const report = this.broadcastReports.get(broadcastId);
            if (report) {
                report.failed++;
                report.errors.push({ tgId: jobData.tgId, error: `Failed to schedule retry: ${error.message}` });
                // Уменьшаем счетчик retrying, так как retry не был запланирован
                report.retrying = Math.max(0, (report.retrying || 0) - 1);
                this.checkProgress(report, broadcastId);
            }
        }
    }

    /**
     * Загружает отчет рассылки из файла
     */
    async loadBroadcastReport(broadcastId: string): Promise<BroadcastReport | null> {
        const reportPath = path.join(this.reportsDir, `${broadcastId}.json`);

        try {
            const reportData = await fs.readFile(reportPath, 'utf8');
            const report: BroadcastReport = JSON.parse(reportData);
            return report;
        } catch (error) {
            this.logger.error(`Failed to load broadcast report ${broadcastId}:`, error);
            return null;
        }
    }

    /**
     * Запускает повторную рассылку для пользователей с ошибками из указанной рассылки
     */
    async startRetryBroadcast(originalBroadcastId: string, adminId: number): Promise<BroadcastReport> {
        // Загружаем исходный отчет
        const originalReport = await this.loadBroadcastReport(originalBroadcastId);
        if (!originalReport) {
            throw new Error(`Отчет рассылки ${originalBroadcastId} не найден`);
        }

        if (!originalReport.errors || originalReport.errors.length === 0) {
            throw new Error(`В рассылке ${originalBroadcastId} нет пользователей с ошибками`);
        }

        // Генерируем новый ID для повторной рассылки
        const retryBroadcastId = `retry-${originalBroadcastId}-${Helper.getRandomString(6)}`;

        // Получаем сообщение, обрабатывая случай когда это может быть массив
        const message = Array.isArray(originalReport.message) ? originalReport.message[0] : originalReport.message;

        // Создаем новый отчет для повторной рассылки
        const report: BroadcastReport = {
            total: originalReport.errors.length,
            sent: 0,
            failed: 0,
            blocked: 0,
            adminId,
            message: message,
            errors: [],
            startTime: Helper.getClearDateNow(),
            status: 'running',
            retrying: 0,
            mainTasksCompletedNotified: false,
        };

        this.broadcastReports.set(retryBroadcastId, report);

        try {
            // Запускаем рассылку по пользователям с ошибками
            await this.queueUsersWithErrors(originalReport, retryBroadcastId, report);
            return report;
        } catch (error) {
            this.logger.error(`Failed to start retry broadcast ${retryBroadcastId}`, error);
            report.status = 'failed';
            throw error;
        }
    }

    /**
     * Добавляет в очередь пользователей с ошибками из исходной рассылки
     */
    private async queueUsersWithErrors(originalReport: BroadcastReport, retryBroadcastId: string, retryReport: BroadcastReport): Promise<void> {
        try {
            // Получаем сообщение, обрабатывая случай когда это может быть массив
            const message = Array.isArray(originalReport.message) ? originalReport.message[0] : originalReport.message;
            const parsedMessage = this.parseMessageForButtons(message);
            const tgIds = originalReport.errors.map(error => error.tgId);

            // Проверяем, что пользователи все еще активны
            const activeTgIds: string[] = [];
            for (const tgId of tgIds) {
                const user = await this.userService.findByTgId(tgId);
                if (user && user.isActive) {
                    activeTgIds.push(tgId);
                }
            }

            if (activeTgIds.length === 0) {
                this.logger.warn(`No active users found for retry broadcast ${retryBroadcastId}`);
                await this.finalizeBroadcast(retryReport, retryBroadcastId);
                return;
            }

            // Добавляем задачи в очередь
            await this.queue.addBulk(
                activeTgIds.map((tgId: string) => ({
                    name: 'send',
                    data: {
                        tgId,
                        payload: message,
                        parsedMessage,
                        broadcastId: retryBroadcastId,
                        adminId: retryReport.adminId
                    },
                })),
            );

            // Обновляем счетчик с учетом активных пользователей
            retryReport.total = activeTgIds.length;

            this.logger.log(`Queued ${activeTgIds.length} users for retry broadcast ${retryBroadcastId} (original broadcast: ${originalReport.startTime})`);
        } catch (error) {
            this.logger.error(`Failed during user queuing for retry broadcast ${retryBroadcastId}`, error);
            retryReport.status = 'failed';
            throw error;
        }
    }
}
