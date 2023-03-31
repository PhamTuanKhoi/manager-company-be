import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @IsOptional()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
