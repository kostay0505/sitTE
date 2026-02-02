import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { FilesController } from './files.controller';

@Module({
  imports: [
    CacheModule.register({
      ttl: 60 * 60 * 24, // 1 день по умолчанию
      max: 1000, // максимальное количество элементов в кэше
    }),
  ],
  controllers: [FilesController],
})
export class FilesModule { }
