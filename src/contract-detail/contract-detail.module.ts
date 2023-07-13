import { Module } from '@nestjs/common';
import { ContractDetailService } from './contract-detail.service';
import { ContractDetailController } from './contract-detail.controller';

@Module({
  controllers: [ContractDetailController],
  providers: [ContractDetailService]
})
export class ContractDetailModule {}
