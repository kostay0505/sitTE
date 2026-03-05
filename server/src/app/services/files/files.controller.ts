import {
  Controller, Post, UploadedFile, UseInterceptors, Get, Param, Res,
  BadRequestException, UnprocessableEntityException, Logger, Inject,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import * as path from 'path';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as crypto from 'crypto';
import * as child_process from 'child_process';
import sharp from 'sharp';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Throttle } from '@nestjs/throttler';

const MAGIC: Record<string, number[][]> = {
  'image/jpeg': [[0xFF,0xD8,0xFF]],
  'image/png':  [[0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A]],
  'image/gif':  [[0x47,0x49,0x46,0x38,0x37,0x61],[0x47,0x49,0x46,0x38,0x39,0x61]],
  'application/pdf': [[0x25,0x50,0x44,0x46]],
};

const ALLOWED_IMAGE = new Set(['image/jpeg','image/png','image/webp','image/gif']);
const ALLOWED_MIME  = new Set(['image/jpeg','image/png','image/webp','image/gif','application/pdf']);
const EXT_MAP: Record<string,string> = {
  'image/jpeg':'.jpg','image/png':'.png','image/webp':'.webp','image/gif':'.gif','application/pdf':'.pdf',
};
const MAX_SIZE = 10 * 1024 * 1024;
const UPLOADS = './uploads';
const TMP = './uploads/tmp';

@Controller('files')
export class FilesController {
  private readonly logger = new Logger(FilesController.name);
  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {
    if (!fs.existsSync(TMP)) fs.mkdirSync(TMP, { recursive: true });
  }

  private checkMagicBytes(filePath: string, mime: string): boolean {
    if (mime === 'image/webp') {
      const buf = Buffer.alloc(12);
      const fd = fs.openSync(filePath,'r');
      fs.readSync(fd, buf, 0, 12, 0);
      fs.closeSync(fd);
      return buf[0]===0x52&&buf[1]===0x49&&buf[2]===0x46&&buf[3]===0x46&&
             buf[8]===0x57&&buf[9]===0x45&&buf[10]===0x42&&buf[11]===0x50;
    }
    const sigs = MAGIC[mime];
    if (!sigs) return false;
    const buf = Buffer.alloc(16);
    const fd = fs.openSync(filePath,'r');
    fs.readSync(fd, buf, 0, 16, 0);
    fs.closeSync(fd);
    return sigs.some(sig => sig.every((b,i) => buf[i]===b));
  }

  private scanClamAV(filePath: string): Promise<boolean> {
    return new Promise(resolve => {
      child_process.execFile('clamscan',['--no-summary', filePath],(err, stdout) => {
        if (err && err.code === 1) {
          this.logger.warn('ClamAV threat: ' + stdout.trim());
          resolve(false);
        } else if (err && err.code !== 0) {
          this.logger.warn('ClamAV unavailable code=' + err.code + ', skipping');
          resolve(true);
        } else {
          resolve(true);
        }
      });
    });
  }

  @Throttle({ upload: { limit: 20, ttl: 3600000 } })
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: TMP,
      filename: (_req, _file, cb) => cb(null, crypto.randomUUID() + '.tmp'),
    }),
    limits: { fileSize: MAX_SIZE },
    fileFilter: (_req, file, cb) => {
      if (!ALLOWED_MIME.has(file.mimetype))
        return cb(new BadRequestException('Недопустимый тип файла'), false);
      cb(null, true);
    },
  }))
  async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<{ filename: string }> {
    if (!file) throw new BadRequestException('Файл не получен');
    const tmp = file.path;
    try {
      if (!this.checkMagicBytes(tmp, file.mimetype))
        throw new BadRequestException('Тип файла не соответствует содержимому');
      if (ALLOWED_IMAGE.has(file.mimetype)) {
        const meta = await sharp(tmp).metadata();
        if (!meta.width || !meta.height) throw new BadRequestException('Не удалось определить размеры');
        if (meta.width > 4500 || meta.height > 4500)
          throw new BadRequestException('Изображение слишком большое (макс. 4500x4500)');
      }
      const clean = await this.scanClamAV(tmp);
      if (!clean) throw new UnprocessableEntityException('Файл отклонён системой безопасности');
      const ext = EXT_MAP[file.mimetype] ?? '.bin';
      const name = crypto.randomUUID() + ext;
      fs.renameSync(tmp, path.join(UPLOADS, name));
      return { filename: name };
    } catch (err) {
      if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
      this.logger.error('Upload error: ' + err?.message);
      if (err instanceof BadRequestException || err instanceof UnprocessableEntityException) throw err;
      throw new BadRequestException('Ошибка при обработке файла');
    }
  }

  @Get(':filename')
  async getFile(@Param('filename') filename: string, @Res() res: Response) {
    const safe = path.basename(filename);
    const filePath = path.join(process.cwd(), UPLOADS, safe);
    if (!fs.existsSync(filePath)) throw new BadRequestException('Файл не найден');
    const stats = fs.statSync(filePath);
    const ext = path.extname(safe).toLowerCase();
    const mime = ({'.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png',
      '.webp':'image/webp','.gif':'image/gif','.pdf':'application/pdf'} as any)[ext] ?? 'application/octet-stream';
    const ttl = 604800;
    const etag = '"' + stats.mtime.getTime() + '-' + stats.size + '"';
    if (res.req.headers['if-none-match'] === etag) return res.status(304).send();
    const cacheKey = 'file:' + safe + ':' + stats.mtime.getTime() + ':' + stats.size;
    const cached = await this.cache.get<Buffer>(cacheKey);
    res.set({ 'Cache-Control': 'public, max-age=' + ttl + ', immutable',
      'ETag': etag, 'Content-Type': mime, 'Content-Length': stats.size.toString(),
      'X-Content-Type-Options': 'nosniff', 'X-Cache': cached ? 'HIT' : 'MISS' });
    if (cached) return res.send(cached);
    const buf = fs.readFileSync(filePath);
    await this.cache.set(cacheKey, buf, ttl);
    return res.send(buf);
  }
}
