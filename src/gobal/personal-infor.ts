import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserGenderEnum } from 'src/user/interfaces/gender-enum';

export class PersonalInfor {
  @IsNotEmpty()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsNotEmpty()
  @IsString()
  mobile?: string;

  @IsOptional()
  @IsString()
  cccd?: string;

  @IsOptional()
  @IsNumber()
  date?: number;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  token?: string;

  @IsOptional()
  @Type(() => Number)
  @IsEnum(UserGenderEnum)
  gender?: number;

  @IsOptional()
  @IsString()
  avatar?: string;

  // @IsOptional()
  // @IsString()
  // avartar: string;
}
