import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateOvertimeDto {
  @IsNotEmpty()
  @IsString()
  user: string;

  @IsNotEmpty()
  @IsString()
  attendance: string;

  @IsNotEmpty()
  @IsString()
  project: string;

  @IsNotEmpty()
  @IsNumber()
  date: number;

  @IsNotEmpty()
  @IsNumber()
  timein: number;

  @IsNotEmpty()
  @IsNumber()
  timeout: number;
}
