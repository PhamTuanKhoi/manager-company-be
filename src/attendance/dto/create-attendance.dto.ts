import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAttendanceDto {
  @IsNotEmpty()
  @IsString()
  user: string;

  @IsNotEmpty()
  @IsString()
  project: string;

  @IsOptional()
  @IsString()
  wiffi?: string;

  @IsNotEmpty()
  @IsNumber()
  timein: number;
}
