import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { WorkerProjectService } from './worker-project.service';
import { CreateWorkerProjectDto } from './dto/create-worker-project.dto';
import { UpdateWorkerProjectDto } from './dto/update-worker-project.dto';

@Controller('worker-project')
export class WorkerProjectController {
  constructor(private readonly workerProjectService: WorkerProjectService) {}

  @Post()
  create(@Body() createWorkerProjectDto: CreateWorkerProjectDto) {
    return this.workerProjectService.create(createWorkerProjectDto);
  }

  @Get()
  findAll() {
    return this.workerProjectService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workerProjectService.findOne(id);
  }

  @Get('project/:id')
  findByProject(@Param('id') id: string) {
    return this.workerProjectService.findByProject(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateWorkerProjectDto: UpdateWorkerProjectDto,
  ) {
    return this.workerProjectService.update(+id, updateWorkerProjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workerProjectService.remove(+id);
  }
}
