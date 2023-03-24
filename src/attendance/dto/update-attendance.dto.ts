import { PartialType } from '@nestjs/mapped-types';
import { IsNumber, IsObject, IsOptional } from 'class-validator';
import { Overtime } from 'src/overtime/schema/overtime.schema';
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
  @IsNumber()
  overtimeQuery?: Overtime;

  shiftsAll?: Overtime[];
}
