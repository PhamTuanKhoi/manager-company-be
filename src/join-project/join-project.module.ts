import { forwardRef, Module } from '@nestjs/common';
import { JoinProjectService } from './join-project.service';
import { JoinProjectController } from './join-project.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { JoinProject, JoinProjectSchema } from './schema/join-project.schema';
import { UserModule } from 'src/user/user.module';
import { ProjectModule } from 'src/project/project.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => ProjectModule),
    MongooseModule.forFeature([
      { name: JoinProject.name, schema: JoinProjectSchema },
    ]),
  ],
  controllers: [JoinProjectController],
  providers: [JoinProjectService],
  exports: [JoinProjectService],
})
export class JoinProjectModule {}
