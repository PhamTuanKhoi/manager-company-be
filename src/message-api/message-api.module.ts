import { forwardRef, Module } from '@nestjs/common';
import { MessageApiService } from './message-api.service';
import { MessageApiController } from './message-api.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageApi, MessageApiSchema } from './schema/message-api.schema';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    MongooseModule.forFeature([
      { name: MessageApi.name, schema: MessageApiSchema },
    ]),
  ],
  controllers: [MessageApiController],
  providers: [MessageApiService],
  exports: [MessageApiService],
})
export class MessageApiModule {}
