import { IsOptional, IsString } from 'class-validator';

export class QueryPartDto {
  @IsOptional()
  part: string;

  @IsString()
  task: string;

  @IsString()
  project: string;
}
