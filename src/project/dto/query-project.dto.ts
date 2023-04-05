import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class QueryProjectDto {
  @IsOptional()
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  role: string;

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

  @IsOptional()
  @IsString()
  text: string;

  @IsOptional()
  @IsString()
  priority: string;
}
