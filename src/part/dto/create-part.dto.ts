import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePartDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  project: string;

  @IsOptional()
  @IsString()
  workers: [];
}
