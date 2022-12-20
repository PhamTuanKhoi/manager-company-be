import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class PersonalInfor {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  mobile: number;

  @IsOptional()
  @IsString()
  avartar: string;

  @IsNumber()
  @IsNotEmpty()
  cccd: number;

  @IsNumber()
  @IsNotEmpty()
  date: number;

  @IsString()
  @IsOptional()
  address: string;

  @IsOptional()
  @IsString()
  token: string;

  @IsOptional()
  @IsString()
  gender: string;
}
