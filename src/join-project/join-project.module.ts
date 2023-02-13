import { Module } from '@nestjs/common';
import { JoinProjectService } from './join-project.service';
import { JoinProjectController } from './join-project.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { JoinProject, JoinProjectSchema } from './schema/join-project.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: JoinProject.name, schema: JoinProjectSchema },
    ]),
  ],
  controllers: [JoinProjectController],
  providers: [JoinProjectService],
  exports: [JoinProjectService],
})
export class JoinProjectModule {}
