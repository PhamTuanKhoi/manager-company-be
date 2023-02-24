import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Query,
} from '@nestjs/common';
import { query, Response } from 'express';
import { get } from 'http';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { QueryAttendanceDto } from './dto/query-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get('personal')
  getAttendancePersonal(@Query() queryAttendanceDto: QueryAttendanceDto) {
    return this.attendanceService.getAttendancePersonal(queryAttendanceDto);
  }

  @Get('today')
  toDayAttendance(@Query() queryAttendanceDto: QueryAttendanceDto) {
    return this.attendanceService.toDayAttendance(queryAttendanceDto);
  }

  @Post()
  create(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.attendanceService.create(createAttendanceDto);
  }

  @Get('wiffi')
  fetchWiffi(@Res() res: Response) {
    return this.attendanceService.fetchWiffi(res);
  }
}
