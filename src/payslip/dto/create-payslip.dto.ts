import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePayslipDto {
  @IsNotEmpty()
  @IsString()
  name: string;
  //Welfare
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  leave: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  reward: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  bonus: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  overtime: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  sunday: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  holiday: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  service: number;

  //Insurance
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  salary_paid_social: number;

  //Insurance
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  medican: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  society: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  unemployment: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  union: number;

  @IsString()
  @IsOptional()
  creator: string;
}
