import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { Overtime } from 'src/overtime/schema/overtime.schema';

export class CreateAttendanceDto {
  @IsNotEmpty()
  @IsString()
  user: string;

  @IsNotEmpty()
  @IsString()
  project: string;

  @IsOptional()
  @IsString()
  overtime?: string;

  @IsOptional()
  @IsString()
  wiffi?: string;

  @IsOptional()
  @IsNumber()
  timein?: number;

  @IsOptional()
  @IsNumber()
  timeout?: number;

  @IsOptional()
  @IsNumber()
  workHour?: number;

  @IsOptional()
  @IsNumber()
  breaks?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  datetime?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  year?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  month?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  date?: number;

  @IsOptional()
  @IsString()
  creator?: string;

  timeinShifts?: number;
  timeoutShifts?: number;
}
