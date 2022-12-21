import { forwardRef, Module } from '@nestjs/common';
import { PayslipService } from './payslip.service';
import { PayslipController } from './payslip.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Payslip, PayslipSchema } from './schema/payslip.schema';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    MongooseModule.forFeature([{ name: Payslip.name, schema: PayslipSchema }]),
  ],
  controllers: [PayslipController],
  providers: [PayslipService],
  exports: [PayslipService],
})
export class PayslipModule {}
