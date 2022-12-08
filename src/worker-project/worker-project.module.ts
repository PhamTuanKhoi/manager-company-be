import { Module } from '@nestjs/common';
import { WorkerProjectService } from './worker-project.service';
import { WorkerProjectController } from './worker-project.controller';

@Module({
  controllers: [WorkerProjectController],
  providers: [WorkerProjectService]
})
export class WorkerProjectModule {}
