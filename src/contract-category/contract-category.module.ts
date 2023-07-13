import { Module } from '@nestjs/common';
import { ContractCategoryService } from './contract-category.service';
import { ContractCategoryController } from './contract-category.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ContractCategory,
  ContractCategorySchema,
} from './schema/contract-category.schema';
import { ProjectModule } from 'src/project/project.module';

@Module({
  imports: [
    ProjectModule,
    MongooseModule.forFeature([
      { name: ContractCategory.name, schema: ContractCategorySchema },
    ]),
  ],
  controllers: [ContractCategoryController],
  providers: [ContractCategoryService],
})
export class ContractCategoryModule {}
