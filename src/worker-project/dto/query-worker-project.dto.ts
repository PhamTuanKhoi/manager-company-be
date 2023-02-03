import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class QueryWorkerProjectDto {
  @IsNotEmpty()
  project: string;

  @IsOptional()
  task: string;
}
