import { forwardRef, Module } from '@nestjs/common';
import { AssignTaskService } from './assign-task.service';
import { AssignTaskController } from './assign-task.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AssignTask, AssignTaskSchema } from './schema/assign-task.schema';
import { UserModule } from 'src/user/user.module';
import { TaskModule } from 'src/task/task.module';
import { PartModule } from 'src/part/part.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => TaskModule),
    forwardRef(() => PartModule),
    MongooseModule.forFeature([
      { name: AssignTask.name, schema: AssignTaskSchema },
    ]),
  ],
  controllers: [AssignTaskController],
  providers: [AssignTaskService],
  exports: [AssignTaskService],
})
export class AssignTaskModule {}
