import { Module } from '@nestjs/common';
import { PartService } from './part.service';
import { PartController } from './part.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Part, PartSchema } from './schema/part.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Part.name, schema: PartSchema }]),
  ],
  controllers: [PartController],
  providers: [PartService],
  exports: [PartService],
})
export class PartModule {}
