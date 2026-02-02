import { Controller, Post, UploadedFile, UseInterceptors, Get, Param, Res, BadRequestException, Logger, Inject } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import * as path from 'path';
import { diskStorage } from 'multer';
import { extname } from 'path';
import sharp from 'sharp';
import * as fs from 'fs';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

// Константы для валидации файлов
const FILE_VALIDATION_CONSTANTS = {
  MAX_IMAGE_DIMENSIONS: {
    WIDTH: 4500,
    HEIGHT: 4500
  },
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_IMAGE_FORMATS: /^image\/(jpeg|jpg|png|webp|gif|svg|svg\+xml)$/,
  SUPPORTED_VIDEO_FORMATS: /^video\/(mp4|webm|ogg|mov|avi|wmv|flv|mkv)$/,
  SUPPORTED_DOCUMENT_FORMATS: /^application\/(pdf|doc|docx|xls|xlsx|ppt|pptx)$/
} as const;

// Константы для кэширования
const CACHE_CONSTANTS = {
  IMAGE_CACHE_TTL: 60 * 60 * 24 * 7, // 7 дней для изображений
  VIDEO_CACHE_TTL: 60 * 60 * 24 * 7, // 7 дней для видео
  DOCUMENT_CACHE_TTL: 60 * 60 * 24 * 7, // 7 дней для документов
  DEFAULT_CACHE_TTL: 60 * 60 * 24, // 1 день по умолчанию
  UPLOADS_DIR: './uploads'
} as const;

@Controller('files')
export class FilesController {
  private readonly logger = new Logger(FilesController.name);

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: CACHE_CONSTANTS.UPLOADS_DIR,
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    limits: {
      fileSize: FILE_VALIDATION_CONSTANTS.MAX_FILE_SIZE,
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.match(FILE_VALIDATION_CONSTANTS.SUPPORTED_IMAGE_FORMATS)) {
        cb(null, true);
        return;
      }
      if (file.mimetype.match(FILE_VALIDATION_CONSTANTS.SUPPORTED_VIDEO_FORMATS)) {
        cb(null, true);
        return;
      }
      if (file.mimetype.match(FILE_VALIDATION_CONSTANTS.SUPPORTED_DOCUMENT_FORMATS)) {
        cb(null, true);
        return;
      }
      cb(new BadRequestException('Неподдерживаемый формат файла'), false);
    },
  }))
  async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<{ filename: string }> {
    if (!file) {
      throw new BadRequestException('Файл не найден');
    }

    try {
      // Валидация размеров изображений
      if (file.mimetype.match(FILE_VALIDATION_CONSTANTS.SUPPORTED_IMAGE_FORMATS)) {
        await this.validateImageDimensions(file);
      }

      // Очищаем кэш для нового файла
      await this.clearFileCache(file.filename);

      return { filename: file.filename };
    } catch (error) {
      this.logger.error('File upload error:', error);

      // Удаляем файл при ошибке валидации
      if (file.path) {
        try {
          fs.unlinkSync(file.path);
        } catch (unlinkError) {
          this.logger.warn('Не удалось удалить файл после ошибки валидации:', unlinkError);
        }
      }

      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Ошибка при сохранении файла');
    }
  }

  private async validateImageDimensions(file: Express.Multer.File): Promise<void> {
    try {
      const metadata = await sharp(file.path).metadata();

      if (!metadata.width || !metadata.height) {
        throw new BadRequestException('Не удалось определить размеры изображения');
      }

      const { WIDTH, HEIGHT } = FILE_VALIDATION_CONSTANTS.MAX_IMAGE_DIMENSIONS;

      if (metadata.width > WIDTH || metadata.height > HEIGHT) {
        throw new BadRequestException(
          `Размеры изображения превышают допустимые: ${metadata.width}x${metadata.height}. ` +
          `Максимальные размеры: ${WIDTH}x${HEIGHT}`
        );
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Ошибка при валидации размеров изображения:', error);
      throw new BadRequestException('Ошибка при проверке размеров изображения');
    }
  }

  @Get(':filename')
  async getImage(@Param('filename') filename: string, @Res() res: Response) {
    try {
      const filePath = path.join(process.cwd(), CACHE_CONSTANTS.UPLOADS_DIR, filename);
      
      // Проверяем существование файла
      if (!fs.existsSync(filePath)) {
        throw new BadRequestException('Файл не найден');
      }

      // Получаем информацию о файле
      const stats = fs.statSync(filePath);
      const ext = path.extname(filename).toLowerCase();
      
      // Определяем MIME тип и время кэширования
      const mimeType = this.getMimeType(ext);
      const cacheTTL = this.getCacheTTL(mimeType);
      
      // Создаем уникальный ключ кэша для файла
      const cacheKey = `file:${filename}:${stats.mtime.getTime()}:${stats.size}`;
      
      // Проверяем кэш
      const cachedFile = await this.cacheManager.get<Buffer>(cacheKey);
      if (cachedFile) {
        res.set({
          'Cache-Control': `public, max-age=${cacheTTL}, immutable`,
          'ETag': `"${stats.mtime.getTime()}-${stats.size}"`,
          'Last-Modified': stats.mtime.toUTCString(),
          'Content-Type': mimeType,
          'Content-Length': stats.size.toString(),
          'X-Cache': 'HIT'
        });
        return res.send(cachedFile);
      }
      
      // Устанавливаем заголовки кэширования
      res.set({
        'Cache-Control': `public, max-age=${cacheTTL}, immutable`,
        'ETag': `"${stats.mtime.getTime()}-${stats.size}"`,
        'Last-Modified': stats.mtime.toUTCString(),
        'Content-Type': mimeType,
        'Content-Length': stats.size.toString(),
        'X-Cache': 'MISS'
      });

      // Проверяем ETag для условного запроса
      const ifNoneMatch = res.req.headers['if-none-match'];
      const ifModifiedSince = res.req.headers['if-modified-since'];
      
      if (ifNoneMatch === `"${stats.mtime.getTime()}-${stats.size}"`) {
        return res.status(304).send();
      }
      
      if (ifModifiedSince && new Date(ifModifiedSince) >= stats.mtime) {
        return res.status(304).send();
      }

      // Читаем файл и кэшируем его
      const fileBuffer = fs.readFileSync(filePath);
      await this.cacheManager.set(cacheKey, fileBuffer, cacheTTL);

      return res.send(fileBuffer);
    } catch (error) {
      this.logger.error('File read error:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Файл не найден');
    }
  }

  private getMimeType(ext: string): string {
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.ogg': 'video/ogg',
      '.mov': 'video/quicktime',
      '.avi': 'video/x-msvideo',
      '.wmv': 'video/x-ms-wmv',
      '.flv': 'video/x-flv',
      '.mkv': 'video/x-matroska',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    };
    
    return mimeTypes[ext] || 'application/octet-stream';
  }

  private getCacheTTL(mimeType: string): number {
    if (mimeType.startsWith('image/')) {
      return CACHE_CONSTANTS.IMAGE_CACHE_TTL;
    }
    if (mimeType.startsWith('video/')) {
      return CACHE_CONSTANTS.VIDEO_CACHE_TTL;
    }
    if (mimeType.startsWith('application/')) {
      return CACHE_CONSTANTS.DOCUMENT_CACHE_TTL;
    }
    return CACHE_CONSTANTS.DEFAULT_CACHE_TTL;
  }

  private async clearFileCache(filename: string): Promise<void> {
    try {
      const filePath = path.join(process.cwd(), CACHE_CONSTANTS.UPLOADS_DIR, filename);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        const cacheKey = `file:${filename}:${stats.mtime.getTime()}:${stats.size}`;
        await this.cacheManager.del(cacheKey);
        this.logger.debug(`Кэш очищен для файла: ${filename}`);
      }
    } catch (error) {
      this.logger.warn(`Ошибка при очистке кэша для файла ${filename}:`, error);
    }
  }
}
