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
import { OvertimeService } from './overtime.service';
import { CreateOvertimeDto } from './dto/create-overtime.dto';
import { UpdateOvertimeDto } from './dto/update-overtime.dto';
import { QueryOvertimeDto } from './dto/query-overtime.dto';

@Controller('overtime')
export class OvertimeController {
  constructor(private readonly overtimeService: OvertimeService) {}

  @Post()
  create(@Body() createOvertimeDto: CreateOvertimeDto) {
    return this.overtimeService.create(createOvertimeDto);
  }

  // use test
  @Get('today')
  today(@Query() queryOvertimeDto: QueryOvertimeDto) {
    return this.overtimeService.toDayOvertimeOfIndividual(queryOvertimeDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.overtimeService.findOne(id);
  }
}
