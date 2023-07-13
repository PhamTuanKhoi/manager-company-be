import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class CreateUserDetailDto {
  @IsString()
  nationnality: string;

  @IsString()
  bornAt: string;

  @IsString()
  resident: string;

  @Type(() => Number)
  @IsNumber()
  dateCccd: number;

  @IsString()
  cccdAt: string;

  @IsString()
  userId: string;
}
