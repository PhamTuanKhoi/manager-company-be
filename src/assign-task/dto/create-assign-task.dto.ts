import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAssignTaskDto {
  @IsNotEmpty()
  @IsString()
  task: string;

  @IsOptional()
  @IsString()
  worker: string;

  @IsOptional()
  @IsString()
  workers: string;

  // value borrow to updated part
  @IsOptional()
  @IsString()
  part: string;

  @IsNotEmpty()
  @IsString()
  creator: string;
}
