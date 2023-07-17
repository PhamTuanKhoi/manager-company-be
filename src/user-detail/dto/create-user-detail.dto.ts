import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateUserDetailDto {
  @IsNotEmpty()
  @IsString()
  nationality: string;

  // @IsNotEmpty()
  @IsString()
  bornAt?: string;

  // @IsNotEmpty()
  @IsString()
  resident?: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  dateCccd?: number;

  // @IsNotEmpty()
  @IsString()
  cccdAt?: string;

  @IsNotEmpty()
  @IsString()
  user: string;
}
