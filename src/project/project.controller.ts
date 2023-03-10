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
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryProjectDto } from './dto/query-project.dto';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  findAll() {
    return this.projectService.findAll();
  }

  @Get('admin')
  findByIdAdim(@Query() queryProjectDto: QueryProjectDto) {
    return this.projectService.findByIdAdmin(queryProjectDto);
  }

  // @Get('client/:id')
  // findByIdClient(@Param('id') id: string) {
  //   return this.projectService.findByIdClient(id);
  // }

  // @Get('employees/:id')
  // findByIdEmployees(@Param('id') id: string) {
  //   return this.projectService.findByIdEmployees(id);
  // }

  @Get('user/:id')
  findByIdUser(@Param('id') id: string) {
    return this.projectService.findByIdUser(id);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.projectService.findById(id);
  }

  @Post()
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectService.create(createProjectDto);
  }

  @Patch('payslip/:id')
  updatePayslip(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectService.updatePayslip(id, updateProjectDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectService.update(id, updateProjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectService.remove(id);
  }
}
