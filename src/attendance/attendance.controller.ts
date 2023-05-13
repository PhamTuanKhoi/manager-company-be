import { Controller, Get, Post, Body, Res, Query } from '@nestjs/common';
import { Response } from 'express';
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

  @Get('detail-to-user')
  toDayAttendanceDetailByIdUser(
    @Query() queryAttendanceDto: QueryAttendanceDto,
  ) {
    return this.attendanceService.toDayAttendanceByIdUser(queryAttendanceDto);
  }

  @Get('today')
  toDayAttendance(@Query() queryAttendanceDto: QueryAttendanceDto) {
    return this.attendanceService.toDayAttendance(queryAttendanceDto);
  }

  @Post('create-or-update')
  createOrUpdate(@Body() updateAttendanceDto: UpdateAttendanceDto) {
    return this.attendanceService.createOrUpdate(updateAttendanceDto);
  }

  @Post('manually')
  manually(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.attendanceService.manually(createAttendanceDto);
  }

  @Post()
  create(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.attendanceService.create(createAttendanceDto);
  }

  @Get('wiffi')
  async fetchWiffi(@Res() res: Response) {
    return await this.attendanceService.fetchWiffi(res);
  }
}
