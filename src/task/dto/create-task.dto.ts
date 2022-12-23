import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTaskDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  project: string;

  @IsOptional()
  @IsString()
  user: string;
}
