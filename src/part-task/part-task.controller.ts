import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PartTaskService } from './part-task.service';
import { CreatePartTaskDto } from './dto/create-part-task.dto';
import { UpdatePartTaskDto } from './dto/update-part-task.dto';

@Controller('part-task')
export class PartTaskController {
  constructor(private readonly partTaskService: PartTaskService) {}

  @Post()
  create(@Body() createPartTaskDto: CreatePartTaskDto) {
    return this.partTaskService.create(createPartTaskDto);
  }

  @Get()
  findAll() {
    return this.partTaskService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.partTaskService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePartTaskDto: UpdatePartTaskDto) {
    return this.partTaskService.update(+id, updatePartTaskDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.partTaskService.remove(+id);
  }
}
