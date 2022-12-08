import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ClientProjectService } from './client-project.service';
import { CreateClientProjectDto } from './dto/create-client-project.dto';
import { UpdateClientProjectDto } from './dto/update-client-project.dto';

@Controller('client-project')
export class ClientProjectController {
  constructor(private readonly clientProjectService: ClientProjectService) {}

  @Post()
  create(@Body() createClientProjectDto: CreateClientProjectDto) {
    return this.clientProjectService.create(createClientProjectDto);
  }

  @Get()
  findAll() {
    return this.clientProjectService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientProjectService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClientProjectDto: UpdateClientProjectDto) {
    return this.clientProjectService.update(+id, updateClientProjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientProjectService.remove(+id);
  }
}
