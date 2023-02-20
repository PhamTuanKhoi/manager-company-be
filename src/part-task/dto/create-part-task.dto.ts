import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePartTaskDto {
  @IsNotEmpty()
  @IsString()
  part: string;

  @IsNotEmpty()
  @IsString()
  task: string;
}
