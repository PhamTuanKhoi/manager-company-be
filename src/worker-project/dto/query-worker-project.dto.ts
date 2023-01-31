import { IsNotEmpty, IsString } from 'class-validator';

export class QueryWorkerProjectDto {
  @IsNotEmpty()
  project: string;

  @IsNotEmpty()
  task: string;
}
