import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { JoinProjectService } from './join-project.service';
import { CreateJoinProjectDto } from './dto/create-join-project.dto';
import { UpdateJoinProjectDto } from './dto/update-join-project.dto';

@Controller('join-project')
export class JoinProjectController {
  constructor(private readonly joinProjectService: JoinProjectService) {}

  @Post()
  create(@Body() createJoinProjectDto: CreateJoinProjectDto) {
    return this.joinProjectService.create(createJoinProjectDto);
  }

  @Get()
  findAll() {
    return this.joinProjectService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.joinProjectService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateJoinProjectDto: UpdateJoinProjectDto,
  ) {
    return this.joinProjectService.update(+id, updateJoinProjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.joinProjectService.remove(+id);
  }
}
