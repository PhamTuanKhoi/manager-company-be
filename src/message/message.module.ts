import { forwardRef, Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageGateway } from './message.gateway';
import { MessageApiModule } from 'src/message-api/message-api.module';

@Module({
  imports: [forwardRef(() => MessageApiModule)],
  providers: [MessageGateway, MessageService],
  exports: [MessageService],
})
export class MessageModule {}
