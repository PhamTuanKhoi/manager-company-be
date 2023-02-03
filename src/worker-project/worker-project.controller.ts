import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { WorkerProjectService } from './worker-project.service';
import { CreateWorkerProjectDto } from './dto/create-worker-project.dto';
import { QueryWorkerProjectDto } from './dto/query-worker-project.dto';

@Controller('worker-project')
export class WorkerProjectController {
  constructor(private readonly workerProjectService: WorkerProjectService) {}

  @Get('assign-task')
  checkNotAssignTask(@Query() queryWorkerProjectDto: QueryWorkerProjectDto) {
    return this.workerProjectService.checkAssignTask(queryWorkerProjectDto);
  }

  @Get('assign-part')
  checkNotAssignPart(@Query() queryWorkerProjectDto: QueryWorkerProjectDto) {
    return this.workerProjectService.checkNotAssignPart(queryWorkerProjectDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workerProjectService.findOne(id);
  }

  @Get('project/:id')
  findByProject(@Param('id') id: string) {
    return this.workerProjectService.findByProject(id);
  }

  @Post()
  create(@Body() createWorkerProjectDto: CreateWorkerProjectDto) {
    return this.workerProjectService.create(createWorkerProjectDto);
  }
}
