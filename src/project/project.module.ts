import { forwardRef, Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectSchema } from './schema/project.schema';
import { UserModule } from 'src/user/user.module';
import { PayslipModule } from 'src/payslip/payslip.module';
import { JoinProjectModule } from 'src/join-project/join-project.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => PayslipModule),
    forwardRef(() => JoinProjectModule),
    MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }]),
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
