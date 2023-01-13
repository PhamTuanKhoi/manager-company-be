import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
export class QueryWorkerProject {
  @IsNotEmpty()
  @IsNumber()
  limit: number;

  @IsNotEmpty()
  @IsString()
  id: string;
}
