import { IsOptional, IsString } from 'class-validator';

export class QueryPartDto {
  @IsOptional()
  part: string;

  @IsOptional()
  @IsString()
  task: string;

  @IsOptional()
  @IsString()
  project: string;
}
