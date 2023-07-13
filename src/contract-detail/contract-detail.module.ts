import { Module } from '@nestjs/common';
import { ContractDetailService } from './contract-detail.service';
import { ContractDetailController } from './contract-detail.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ContractDetail,
  ContractDetailSchema,
} from './schema/contract-detail.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ContractDetail.name, schema: ContractDetailSchema },
    ]),
  ],
  controllers: [ContractDetailController],
  providers: [ContractDetailService],
})
export class ContractDetailModule {}
