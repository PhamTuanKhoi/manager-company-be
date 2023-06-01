import {
  CacheModule,
  CacheModuleAsyncOptions,
  CACHE_MANAGER,
  Module,
} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
import { DepartmentModule } from './department/department.module';
import { BullModule } from '@nestjs/bull';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGGO_URL),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST'),
          port: +configService.get<string>('REDIS_PORT'),
          password: configService.get<string>('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
      isGlobal: true, // use full system
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          url: configService.get('REDIS_URI'),
        }),
      }),
      inject: [ConfigService],
    }),
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
    DepartmentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
