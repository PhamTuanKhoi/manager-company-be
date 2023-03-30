import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class QueryUserPayrollDto {
  @IsOptional()
  @IsString()
  user: string;

  @IsOptional()
  @IsString()
  project: string;

  @IsOptional()
  @IsString()
  salary: string;

  @IsOptional()
  @IsString()
  payslip: string;

  @IsOptional()
  @IsString()
  contract: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  year: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  month: number;
}
