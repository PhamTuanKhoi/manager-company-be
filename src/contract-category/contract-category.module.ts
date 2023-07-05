import { Module } from '@nestjs/common';
import { ContractCategoryService } from './contract-category.service';
import { ContractCategoryController } from './contract-category.controller';

@Module({
  controllers: [ContractCategoryController],
  providers: [ContractCategoryService]
})
export class ContractCategoryModule {}
