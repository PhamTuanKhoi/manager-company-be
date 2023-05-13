import { forwardRef, Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Attendance, AttendanceSchema } from './schema/attendance.schema';
import { UserModule } from 'src/user/user.module';
import { ProjectModule } from 'src/project/project.module';
import { RulesModule } from 'src/rules/rules.module';
import { OvertimeModule } from 'src/overtime/overtime.module';
import { BullModule } from '@nestjs/bull';
import { BULLL_NAME } from './contants/bull.name';
import { AttendanceConsumer } from './attendance.consumer';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => ProjectModule),
    forwardRef(() => RulesModule),
    forwardRef(() => OvertimeModule),
    MongooseModule.forFeature([
      { name: Attendance.name, schema: AttendanceSchema },
    ]),
    BullModule.registerQueue({
      name: BULLL_NAME,
    }),
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService, AttendanceConsumer],
  exports: [AttendanceService],
})
export class AttendanceModule {}
