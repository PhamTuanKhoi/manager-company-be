import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ProjectModule } from './project/project.module';
import { EmployProjectModule } from './employ-project/employ-project.module';
import { WorkerProjectModule } from './worker-project/worker-project.module';
import { ClientProjectModule } from './client-project/client-project.module';
import { ClientModule } from './client/client.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGGO_URL),
    UserModule,
    AuthModule,
    ProjectModule,
    EmployProjectModule,
    WorkerProjectModule,
    ClientProjectModule,
    ClientModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
