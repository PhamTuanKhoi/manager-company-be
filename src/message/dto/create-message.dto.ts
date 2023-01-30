import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  from: string;

  @IsString()
  @IsNotEmpty()
  to: string;

  @IsOptional()
  message: string;

  @IsOptional()
  name: string;

  @IsOptional()
  createdAt: number;

  @IsOptional()
  avartar: string;
}
