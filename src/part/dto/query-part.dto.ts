import { IsString } from 'class-validator';

export class QueryPartDto {
  @IsString()
  part: string;

  @IsString()
  task: string;

  @IsString()
  project: string;
}
