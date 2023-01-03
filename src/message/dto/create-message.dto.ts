import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  userEmit: string;

  @IsString()
  @IsNotEmpty()
  userOn: string;

  @IsOptional()
  message: string;
}
