import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { OvertimeTypeEnum } from '../enum/type-overtime.enum';

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

  @IsNotEmpty()
  @IsEnum(OvertimeTypeEnum)
  type: OvertimeTypeEnum;
}
