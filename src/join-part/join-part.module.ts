import { forwardRef, Module } from '@nestjs/common';
import { JoinPartService } from './join-part.service';
import { JoinPartController } from './join-part.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { JoinPart, JoinPartSchema } from './schema/join-part.schema';
import { UserModule } from 'src/user/user.module';
import { PartModule } from 'src/part/part.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => PartModule),
    MongooseModule.forFeature([
      { name: JoinPart.name, schema: JoinPartSchema },
    ]),
  ],
  controllers: [JoinPartController],
  providers: [JoinPartService],
  exports: [JoinPartService],
})
export class JoinPartModule {}
