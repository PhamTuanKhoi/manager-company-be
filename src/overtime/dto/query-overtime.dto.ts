import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { OvertimeTypeEnum } from '../enum/type-overtime.enum';

export class QueryOvertimeDto {
  @IsOptional()
  @IsString()
  project?: string;

  @IsOptional()
  @IsString()
  user?: string;

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
  @IsEnum(() => OvertimeTypeEnum)
  type?: OvertimeTypeEnum;
}
