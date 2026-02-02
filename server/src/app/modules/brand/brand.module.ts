import { Module, forwardRef } from '@nestjs/common';
import { BrandController } from './brand.controller';
import { BrandService } from './brand.service';
import { BrandRepository } from './brand.repository';
import { HrefModule } from '../../services/href/href.module';

@Module({
  imports: [forwardRef(() => HrefModule)],
  controllers: [BrandController],
  providers: [BrandService, BrandRepository],
  exports: [BrandService, BrandRepository]
})
export class BrandModule {}
