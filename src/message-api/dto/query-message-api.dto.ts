import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class QueryMessageApiDto {
  @IsString()
  @IsOptional()
  from: string;

  @IsString()
  @IsOptional()
  to: string;

  @IsOptional()
  message: string;
}
