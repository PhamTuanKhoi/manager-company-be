import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateContractCategoryDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  startDate: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  endDate: number;

  @IsNotEmpty()
  @IsString()
  project: string;
}
