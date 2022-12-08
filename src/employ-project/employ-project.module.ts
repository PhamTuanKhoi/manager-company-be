import { Module } from '@nestjs/common';
import { EmployProjectService } from './employ-project.service';
import { EmployProjectController } from './employ-project.controller';

@Module({
  controllers: [EmployProjectController],
  providers: [EmployProjectService]
})
export class EmployProjectModule {}
