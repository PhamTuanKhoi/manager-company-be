import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRuleDto {
  @IsNotEmpty()
  @IsString()
  project: string;

  // @IsNotEmpty()
  @IsOptional()
  @IsString()
  wiffi: string;

  // @IsNotEmpty()
  @IsOptional()
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
