import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { CreateUserDetailDto } from 'src/user-detail/dto/create-user-detail.dto';
import { UserGenderEnum } from 'src/user/interfaces/gender-enum';

export class CombinedWorkerAndUserDto extends PartialType(CreateUserDetailDto) {
  @IsNotEmpty()
  @IsString()
  _id: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  date: number;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsString()
  cccd: string;

  @IsNotEmpty()
  @IsString()
  field: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsEnum(UserGenderEnum)
  gender: number;
}
