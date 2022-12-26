import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAssignTaskDto {
  @IsNotEmpty()
  @IsString()
  task: string;

  @IsNotEmpty()
  @IsString()
  worker: string;

  @IsNotEmpty()
  @IsString()
  creator: string;
}
