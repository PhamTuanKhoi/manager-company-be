import { Module } from '@nestjs/common';
import { ContractDetailService } from './contract-detail.service';
import { ContractDetailController } from './contract-detail.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ContractDetail,
  ContractDetailSchema,
} from './schema/contract-detail.schema';
import { BullModule } from '@nestjs/bull';
import { BULLL_NAME_CONTRACT_DETAIL } from 'src/attendance/contants/bull.name';
import { ContractDetailConsumer } from './contract-detail.consumer';
import { UserModule } from 'src/user/user.module';
import { UserDetailModule } from 'src/user-detail/user-detail.module';

@Module({
  imports: [
    UserModule,
    UserDetailModule,
    MongooseModule.forFeature([
      { name: ContractDetail.name, schema: ContractDetailSchema },
    ]),
    BullModule.registerQueue({
      name: BULLL_NAME_CONTRACT_DETAIL,
    }),
  ],
  controllers: [ContractDetailController],
  providers: [ContractDetailService, ContractDetailConsumer],
  exports: [ContractDetailService],
})
export class ContractDetailModule {}
