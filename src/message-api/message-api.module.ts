import { Module } from '@nestjs/common';
import { MessageApiService } from './message-api.service';
import { MessageApiController } from './message-api.controller';

@Module({
  controllers: [MessageApiController],
  providers: [MessageApiService]
})
export class MessageApiModule {}
