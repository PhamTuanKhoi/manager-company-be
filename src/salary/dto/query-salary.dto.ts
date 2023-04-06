import { IsOptional, IsString } from 'class-validator';

export class QuerySalaryDto {
  @IsOptional()
  @IsString()
  name: string;
}
