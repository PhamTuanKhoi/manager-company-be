import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ProjectModule } from './project/project.module';
import { WorkerProjectModule } from './worker-project/worker-project.module';
import { ClientProjectModule } from './client-project/client-project.module';
import { PayslipModule } from './payslip/payslip.module';
import { TaskModule } from './task/task.module';
import { AssignTaskModule } from './assign-task/assign-task.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGGO_URL),
    UserModule,
    AuthModule,
    ProjectModule,
    WorkerProjectModule,
    ClientProjectModule,
    PayslipModule,
    TaskModule,
    AssignTaskModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
