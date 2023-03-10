import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ProjectModule } from './project/project.module';
import { WorkerProjectModule } from './worker-project/worker-project.module';
import { PayslipModule } from './payslip/payslip.module';
import { TaskModule } from './task/task.module';
import { AssignTaskModule } from './assign-task/assign-task.module';
import { MessageModule } from './message/message.module';
import { MessageApiModule } from './message-api/message-api.module';
import { PartModule } from './part/part.module';
import { JoinProjectModule } from './join-project/join-project.module';
import { JoinPartModule } from './join-part/join-part.module';
import { PartTaskModule } from './part-task/part-task.module';
import { AttendanceModule } from './attendance/attendance.module';
import { RulesModule } from './rules/rules.module';
import { SalaryModule } from './salary/salary.module';
import { ContractModule } from './contract/contract.module';
import { OvertimeModule } from './overtime/overtime.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGGO_URL),
    UserModule,
    AuthModule,
    ProjectModule,
    WorkerProjectModule,
    PayslipModule,
    TaskModule,
    AssignTaskModule,
    MessageModule,
    MessageApiModule,
    PartModule,
    JoinProjectModule,
    JoinPartModule,
    PartTaskModule,
    AttendanceModule,
    RulesModule,
    SalaryModule,
    ContractModule,
    OvertimeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
