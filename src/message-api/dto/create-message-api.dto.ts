import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMessageApiDto {
  @IsString()
  @IsNotEmpty()
  from: string;

  @IsString()
  @IsNotEmpty()
  to: string;

  @IsOptional()
  message: string;
}
