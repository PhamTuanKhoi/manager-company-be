import { Module } from '@nestjs/common';
import { OvertimeService } from './overtime.service';
import { OvertimeController } from './overtime.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Overtime, OvertimeSchema } from './schema/overtime.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Overtime.name, schema: OvertimeSchema },
    ]),
  ],
  controllers: [OvertimeController],
  providers: [OvertimeService],
})
export class OvertimeModule {}
