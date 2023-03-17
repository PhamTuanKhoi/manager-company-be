import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
} from '@nestjs/common';
import { JoinPartService } from './join-part.service';
import { CreateJoinPartDto } from './dto/create-join-part.dto';
import { UpdateJoinPartDto } from './dto/update-join-part.dto';
import { Response } from 'express';

@Controller('join-part')
export class JoinPartController {
  constructor(private readonly joinPartService: JoinPartService) {}

  @Post()
  create(@Body() createJoinPartDto: CreateJoinPartDto) {
    return this.joinPartService.create(createJoinPartDto);
  }

  @Get()
  findAll(@Res() res: Response) {
    return this.joinPartService.findAll(res);
  }

  @Get('okay')
  findthanks(@Res() res: Response) {
    return this.joinPartService.findthanks(res);
  }

  @Post('test')
  testSave(@Body() data) {
    return this.joinPartService.testSave(data);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.joinPartService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateJoinPartDto: UpdateJoinPartDto,
  ) {
    return this.joinPartService.update(+id, updateJoinPartDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.joinPartService.remove(id);
  }
}
