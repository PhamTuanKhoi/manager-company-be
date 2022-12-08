import { Module } from '@nestjs/common';
import { ClientProjectService } from './client-project.service';
import { ClientProjectController } from './client-project.controller';

@Module({
  controllers: [ClientProjectController],
  providers: [ClientProjectService]
})
export class ClientProjectModule {}
