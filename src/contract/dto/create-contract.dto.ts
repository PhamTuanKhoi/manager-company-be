import { IsNotEmpty, IsString } from 'class-validator';

export class CreateContractDto {
  @IsNotEmpty()
  @IsString()
  salary: string;

  @IsNotEmpty()
  @IsString()
  user: string;

  @IsNotEmpty()
  @IsString()
  project: string;

  @IsNotEmpty()
  @IsString()
  creator: string;
}
