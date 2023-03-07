import { PartialType } from '@nestjs/mapped-types';
import { IsNumber, IsObject, IsOptional } from 'class-validator';
import { CreateAttendanceDto } from './create-attendance.dto';

export class UpdateAttendanceDto extends PartialType(CreateAttendanceDto) {
  @IsOptional()
  @IsNumber()
  timeout?: number;

  @IsOptional()
  @IsNumber()
  year?: number;

  @IsOptional()
  @IsNumber()
  month?: number;

  @IsOptional()
  @IsNumber()
  date?: number;

  @IsOptional()
  @IsObject()
  ovtexport?: {
    date: number;
    timein: number;
    timeout: number;
  };
}
