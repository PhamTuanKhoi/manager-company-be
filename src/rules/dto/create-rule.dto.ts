import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRuleDto {
  @IsNotEmpty()
  @IsString()
  project: string;

  @IsNotEmpty()
  @IsString()
  wiffi: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsNumber()
  timeIn: number;

  @IsNotEmpty()
  @IsNumber()
  timeOut: number;

  @IsOptional()
  @IsNumber()
  lunchIn: number;

  @IsOptional()
  @IsNumber()
  lunchOut: number;
}
