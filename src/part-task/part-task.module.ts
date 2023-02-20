import { forwardRef, Module } from '@nestjs/common';
import { PartTaskService } from './part-task.service';
import { PartTaskController } from './part-task.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PartTask, PartTaskSchema } from './schema/part-task.schema';
import { PartModule } from 'src/part/part.module';
import { TaskModule } from 'src/task/task.module';

@Module({
  imports: [
    forwardRef(() => PartModule),
    forwardRef(() => TaskModule),
    MongooseModule.forFeature([
      { name: PartTask.name, schema: PartTaskSchema },
    ]),
  ],
  controllers: [PartTaskController],
  providers: [PartTaskService],
  exports: [PartTaskService],
})
export class PartTaskModule {}
