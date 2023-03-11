import { IsNumber, IsOptional } from 'class-validator';

export class QueryDateDto {
  @IsOptional()
  @IsNumber()
  year: number;

  @IsOptional()
  @IsNumber()
  month: number;

  @IsOptional()
  @IsNumber()
  date: number;
}
