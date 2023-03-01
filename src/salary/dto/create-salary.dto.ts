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
  @Length(4, 100)
  beneficiary: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salary: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  go: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  home: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  toxic: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  diligence: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  eat: number;
}
