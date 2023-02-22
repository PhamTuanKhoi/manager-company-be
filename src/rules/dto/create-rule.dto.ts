import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateRuleDto {
  @IsNotEmpty()
  @IsString()
  project: string;

  @IsNotEmpty()
  @IsNumber()
  timeIn: number;

  @IsNotEmpty()
  @IsNumber()
  timeOut: number;

  @IsNotEmpty()
  @IsString()
  wiffi: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
