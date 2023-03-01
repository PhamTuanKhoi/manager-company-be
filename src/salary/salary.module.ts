import { forwardRef, Module } from '@nestjs/common';
import { SalaryService } from './salary.service';
import { SalaryController } from './salary.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Salary, SalarySchema } from './schema/salary.schema';
import { ProjectModule } from 'src/project/project.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    forwardRef(() => ProjectModule),
    forwardRef(() => UserModule),
    MongooseModule.forFeature([{ name: Salary.name, schema: SalarySchema }]),
  ],
  controllers: [SalaryController],
  providers: [SalaryService],
  exports: [SalaryService],
})
export class SalaryModule {}
