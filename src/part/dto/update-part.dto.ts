import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString } from 'class-validator';
import { CreatePartDto } from './create-part.dto';

export class UpdatePartDto extends PartialType(CreatePartDto) {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  creator?: string;
}
