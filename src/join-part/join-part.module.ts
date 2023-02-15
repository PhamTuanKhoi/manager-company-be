import { forwardRef, Module } from '@nestjs/common';
import { JoinPartService } from './join-part.service';
import { JoinPartController } from './join-part.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { JoinPart, JoinPartSchema } from './schema/join-part.schema';
import { UserModule } from 'src/user/user.module';
import { ProjectModule } from 'src/project/project.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => ProjectModule),
    MongooseModule.forFeature([
      { name: JoinPart.name, schema: JoinPartSchema },
    ]),
  ],
  controllers: [JoinPartController],
  providers: [JoinPartService],
  exports: [JoinPartService],
})
export class JoinPartModule {}
