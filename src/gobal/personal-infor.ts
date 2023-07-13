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

  @IsOptional()
  @IsString()
  email?: string;

  @IsNotEmpty()
  @IsString()
  mobile: string;

  // @IsOptional()
  // @IsString()
  // avartar: string;

  @IsString()
  @IsOptional()
  cccd: string;

  @IsNumber()
  @IsOptional()
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

  @IsOptional()
  @IsString()
  avatar: string;
}
