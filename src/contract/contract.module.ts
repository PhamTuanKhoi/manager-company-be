import { forwardRef, Module } from '@nestjs/common';
import { ContractService } from './contract.service';
import { ContractController } from './contract.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Contract, ContractSchema } from './schema/contract.schema';
import { SalaryModule } from 'src/salary/salary.module';
import { UserModule } from 'src/user/user.module';
import { ProjectModule } from 'src/project/project.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => SalaryModule),
    forwardRef(() => ProjectModule),
    MongooseModule.forFeature([
      { name: Contract.name, schema: ContractSchema },
    ]),
  ],
  controllers: [ContractController],
  providers: [ContractService],
  exports: [ContractService],
})
export class ContractModule {}
