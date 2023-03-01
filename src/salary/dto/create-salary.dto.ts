import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class CreateSalaryDto {
  @IsNotEmpty()
  @IsString()
  project: string;

  @IsNotEmpty()
  @IsString()
  creator: string;

  @IsNotEmpty()
  @IsString()
  @Length(4, 100)
  beneficiary: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  salary: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  go: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  home: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  toxic: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  diligence: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  eat: number;
}
