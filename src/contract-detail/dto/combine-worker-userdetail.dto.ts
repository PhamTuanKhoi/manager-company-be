import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { CreateUserDetailDto } from 'src/user-detail/dto/create-user-detail.dto';

export class CombinedWorkerAndUserDto extends CreateUserDetailDto {
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
  @Type(() => Number)
  @IsNumber()
  cccd: number;

  @IsNotEmpty()
  @IsString()
  field: string;

  @IsNotEmpty()
  @IsString()
  gender: string;
}
