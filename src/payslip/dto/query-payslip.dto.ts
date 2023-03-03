import { IsOptional, IsString } from 'class-validator';

export class QueryPayslipDto {
  @IsOptional()
  @IsString()
  payslip: string;

  @IsOptional()
  @IsString()
  project: string;

  @IsOptional()
  @IsString()
  salary: string;
}
