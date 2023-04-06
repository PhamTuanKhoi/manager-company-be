import { IsOptional, IsString } from 'class-validator';

export class QueryUserSalaryDto {
  @IsOptional()
  @IsString()
  salary: string;

  @IsOptional()
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  name: string;
}
