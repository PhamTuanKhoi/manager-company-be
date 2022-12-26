import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AssignTaskService } from './assign-task.service';
import { CreateAssignTaskDto } from './dto/create-assign-task.dto';
import { UpdateAssignTaskDto } from './dto/update-assign-task.dto';

@Controller('assign-task')
export class AssignTaskController {
  constructor(private readonly assignTaskService: AssignTaskService) {}

  @Get()
  list() {
    return this.assignTaskService.list();
  }

  @Get('task/:id')
  findByTask(@Param('id') id: string) {
    return this.assignTaskService.findByTask(id);
  }

  @Post()
  create(@Body() createAssignTaskDto: CreateAssignTaskDto) {
    return this.assignTaskService.create(createAssignTaskDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assignTaskService.remove(+id);
  }
}
