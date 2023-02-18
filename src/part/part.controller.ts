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
import { PartService } from './part.service';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';
import { QueryPartDto } from './dto/query-part.dto';

@Controller('part')
export class PartController {
  constructor(private readonly partService: PartService) {}

  @Post()
  create(@Body() createPartDto: CreatePartDto) {
    return this.partService.create(createPartDto);
  }

  @Get('not-task')
  checkNotTask(@Query() queryPartDto: QueryPartDto) {
    return this.partService.checkNotTask(queryPartDto);
  }

  @Get('child')
  findPartByIdPartAndProject(@Query() queryPartDto: QueryPartDto) {
    return this.partService.findPartByIdPartAndProject(queryPartDto);
  }

  @Get(':id/project')
  findByIdProject(@Param('id') id: string) {
    return this.partService.findByIdProject(id);
  }

  @Get('precent')
  precent(@Query() queryPartDto: QueryPartDto) {
    return this.partService.precent(queryPartDto);
  }

  // @Patch('workers/:id')
  // updateFieldWorkers(
  //   @Param('id') id: string,
  //   @Body() updatePartDto: UpdatePartDto,
  // ) {
  //   return this.partService.updateFieldWorkers(id, updatePartDto);
  // }

  // @Delete('remove-user/:partId/:userId')
  // removeUserInPart(
  //   @Param('partId') partId: string,
  //   @Param('userId') userId: string,
  // ) {
  //   return this.partService.removeUserInPart(partId, userId);
  // }
}
