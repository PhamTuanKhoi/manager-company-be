import { forwardRef, Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageGateway } from './message.gateway';
import { MessageApiModule } from 'src/message-api/message-api.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [forwardRef(() => MessageApiModule), AuthModule],
  providers: [MessageGateway, MessageService],
  exports: [MessageService],
})
export class MessageModule {}
