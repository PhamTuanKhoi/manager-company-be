import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class QueryUserOvertimeDto {
  @IsOptional()
  @IsString()
  project: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  year: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  month: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  date: number;
}
