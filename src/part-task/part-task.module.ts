import { Module } from '@nestjs/common';
import { PartTaskService } from './part-task.service';
import { PartTaskController } from './part-task.controller';

@Module({
  controllers: [PartTaskController],
  providers: [PartTaskService]
})
export class PartTaskModule {}
