import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class PersonalInfor {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  mobile: string;

  @IsOptional()
  @IsString()
  avartar: string;

  @IsString()
  @IsNotEmpty()
  cccd: string;

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
