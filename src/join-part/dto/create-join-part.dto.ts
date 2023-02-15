import { IsNotEmpty, IsString } from 'class-validator';

export class CreateJoinPartDto {
  @IsNotEmpty()
  @IsString()
  joinor: string;

  @IsNotEmpty()
  @IsString()
  part: string;
}
