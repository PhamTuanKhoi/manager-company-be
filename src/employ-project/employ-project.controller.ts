import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EmployProjectService } from './employ-project.service';
import { CreateEmployProjectDto } from './dto/create-employ-project.dto';
import { UpdateEmployProjectDto } from './dto/update-employ-project.dto';

@Controller('employ-project')
export class EmployProjectController {
  constructor(private readonly employProjectService: EmployProjectService) {}

  @Post()
  create(@Body() createEmployProjectDto: CreateEmployProjectDto) {
    return this.employProjectService.create(createEmployProjectDto);
  }

  @Get()
  findAll() {
    return this.employProjectService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employProjectService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEmployProjectDto: UpdateEmployProjectDto) {
    return this.employProjectService.update(+id, updateEmployProjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.employProjectService.remove(+id);
  }
}
