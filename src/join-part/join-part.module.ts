import { Module } from '@nestjs/common';
import { JoinPartService } from './join-part.service';
import { JoinPartController } from './join-part.controller';

@Module({
  controllers: [JoinPartController],
  providers: [JoinPartService]
})
export class JoinPartModule {}
