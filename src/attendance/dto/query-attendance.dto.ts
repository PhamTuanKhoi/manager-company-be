import { IsOptional, IsString } from 'class-validator';

export class QueryAttendanceDto {
  @IsOptional()
  @IsString()
  user: string;

  @IsOptional()
  @IsString()
  project: string;

  @IsOptional()
  date: number;
}
