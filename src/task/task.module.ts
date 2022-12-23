import { forwardRef, Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from './schema/task.schema';
import { UserModule } from 'src/user/user.module';
import { ProjectModule } from 'src/project/project.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => ProjectModule),
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
  ],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}
