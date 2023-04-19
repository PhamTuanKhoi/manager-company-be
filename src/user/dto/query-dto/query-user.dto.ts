import { IsOptional, IsString } from 'class-validator';

export class QueryUserDto {
  @IsOptional()
  @IsString()
  project: string;

  @IsOptional()
  @IsString()
  role: string;

  @IsOptional()
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  departmentId: string;
}
