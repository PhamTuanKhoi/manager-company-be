import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAssignTaskDto {
  @IsOptional()
  @IsString()
  task: string;

  @IsOptional()
  @IsString()
  worker: string;

  @IsOptional()
  workers: string;

  // value borrow to updated part
  @IsOptional()
  part: string;

  @IsOptional()
  @IsString()
  creator: string;
}
