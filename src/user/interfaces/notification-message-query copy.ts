import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
export class QueryNotificationMessage {
  @IsOptional()
  @IsNumber()
  limit: number;

  @IsNotEmpty()
  @IsString()
  id: string;
}
