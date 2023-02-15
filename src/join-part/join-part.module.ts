import { Module } from '@nestjs/common';
import { JoinPartService } from './join-part.service';
import { JoinPartController } from './join-part.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { JoinPart, JoinPartSchema } from './schema/join-part.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: JoinPart.name, schema: JoinPartSchema },
    ]),
  ],
  controllers: [JoinPartController],
  providers: [JoinPartService],
  exports: [JoinPartService],
})
export class JoinPartModule {}
