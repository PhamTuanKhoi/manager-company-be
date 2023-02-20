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

  @Get('perform/:id/project')
  performTrueByIdProject(@Param('id') id: string) {
    return this.assignTaskService.performTrueByIdProject(id);
  }

  @Get('finish/:id/project')
  finishTrueByIdProject(@Param('id') id: string) {
    return this.assignTaskService.finishTrueByIdProject(id);
  }

  @Get('precent-finish/:id/project')
  precentFinishTrueByIdProject(@Param('id') id: string) {
    return this.assignTaskService.precentFinishTrueByIdProject(id);
  }

  @Get('task/perform/:id/project')
  taskPerformTrueByIdProject(@Param('id') id: string) {
    return this.assignTaskService.taskPerformTrueByIdProject(id);
  }

  @Get('task/finish/:id/project')
  taskFinishTrueByIdProject(@Param('id') id: string) {
    return this.assignTaskService.taskFinishTrueByIdProject(id);
  }

  @Get('task/:id')
  findByTask(@Param('id') id: string) {
    return this.assignTaskService.findByTask(id);
  }

  @Get('project/:id')
  findByProject(@Param('id') id: string) {
    return this.assignTaskService.findByProject(id);
  }

  @Post()
  create(@Body() createAssignTaskDto: CreateAssignTaskDto) {
    return this.assignTaskService.create(createAssignTaskDto);
  }

  // @Post('part')
  // createByPart(@Body() createAssignTaskDto: CreateAssignTaskDto) {
  //   return this.assignTaskService.createByPart(createAssignTaskDto);
  // }

  @Patch('perform/:id')
  updatePerform(
    @Param('id') id: string,
    @Body() updatePerform: { verify: boolean },
  ) {
    return this.assignTaskService.updatePerform(id, updatePerform);
  }

  @Patch('finish/:id')
  updateFinish(
    @Param('id') id: string,
    @Body() updateFinish: { verify: boolean },
  ) {
    return this.assignTaskService.updateFinish(id, updateFinish);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assignTaskService.remove(+id);
  }
}
