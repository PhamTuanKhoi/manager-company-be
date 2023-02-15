import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { JoinPartService } from './join-part.service';
import { CreateJoinPartDto } from './dto/create-join-part.dto';
import { UpdateJoinPartDto } from './dto/update-join-part.dto';

@Controller('join-part')
export class JoinPartController {
  constructor(private readonly joinPartService: JoinPartService) {}

  @Post()
  create(@Body() createJoinPartDto: CreateJoinPartDto) {
    return this.joinPartService.create(createJoinPartDto);
  }

  @Get()
  findAll() {
    return this.joinPartService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.joinPartService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateJoinPartDto: UpdateJoinPartDto) {
    return this.joinPartService.update(+id, updateJoinPartDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.joinPartService.remove(+id);
  }
}
