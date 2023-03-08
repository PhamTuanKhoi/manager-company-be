import { forwardRef, Module, Scope } from '@nestjs/common';
import { OvertimeService } from './overtime.service';
import { OvertimeController } from './overtime.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Overtime, OvertimeSchema } from './schema/overtime.schema';
import { UserModule } from 'src/user/user.module';
import { ProjectModule } from 'src/project/project.module';
import { AttendanceModule } from 'src/attendance/attendance.module';
import { RulesModule } from 'src/rules/rules.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => ProjectModule),
    forwardRef(() => AttendanceModule),
    forwardRef(() => RulesModule),
    MongooseModule.forFeature([
      { name: Overtime.name, schema: OvertimeSchema },
    ]),
  ],
  controllers: [OvertimeController],
  providers: [OvertimeService],
  exports: [OvertimeService],
})
export class OvertimeModule {}
