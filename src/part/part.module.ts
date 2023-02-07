import { forwardRef, Module } from '@nestjs/common';
import { PartService } from './part.service';
import { PartController } from './part.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Part, PartSchema } from './schema/part.schema';
import { ProjectModule } from 'src/project/project.module';
import { UserModule } from 'src/user/user.module';
import { AssignTaskModule } from 'src/assign-task/assign-task.module';

@Module({
  imports: [
    forwardRef(() => ProjectModule),
    forwardRef(() => UserModule),
    forwardRef(() => AssignTaskModule),
    MongooseModule.forFeature([{ name: Part.name, schema: PartSchema }]),
  ],
  controllers: [PartController],
  providers: [PartService],
  exports: [PartService],
})
export class PartModule {}
