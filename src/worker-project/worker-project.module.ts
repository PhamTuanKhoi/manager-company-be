import { forwardRef, Module } from '@nestjs/common';
import { WorkerProjectService } from './worker-project.service';
import { WorkerProjectController } from './worker-project.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  WorkerProject,
  WorkerProjectSchema,
} from './schema/worker-project.shema';
import { UserModule } from 'src/user/user.module';
import { ProjectModule } from 'src/project/project.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => ProjectModule),
    MongooseModule.forFeature([
      { name: WorkerProject.name, schema: WorkerProjectSchema },
    ]),
  ],
  controllers: [WorkerProjectController],
  providers: [WorkerProjectService],
  exports: [WorkerProjectService],
})
export class WorkerProjectModule {}
