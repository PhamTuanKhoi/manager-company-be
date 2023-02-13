import { Module } from '@nestjs/common';
import { JoinProjectService } from './join-project.service';
import { JoinProjectController } from './join-project.controller';

@Module({
  controllers: [JoinProjectController],
  providers: [JoinProjectService]
})
export class JoinProjectModule {}
