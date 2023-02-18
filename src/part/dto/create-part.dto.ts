import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePartDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  project: string;

  @IsNotEmpty()
  @IsString()
  heador: string;

  @IsNotEmpty()
  @IsString()
  creator: string;

  @IsOptional()
  @IsString()
  parent: string;
}
