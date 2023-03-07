import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateOvertimeDto {
  @IsOptional()
  @IsArray()
  userIds: string[];

  @IsOptional()
  @IsString()
  user: string;

  @IsNotEmpty()
  @IsString()
  project: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  date: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  timein: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  timeout: number;
}
