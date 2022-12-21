import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePayslipDto {
  @IsNumber()
  @IsNotEmpty()
  name: string;
  //Welfare
  @IsNumber()
  @IsOptional()
  leave: number;

  @IsNumber()
  @IsOptional()
  reward: number;

  @IsNumber()
  @IsOptional()
  rice: number;

  @IsNumber()
  @IsOptional()
  bonus: number;

  @IsNumber()
  @IsOptional()
  overtime: number;

  @IsNumber()
  @IsOptional()
  sunday: number;

  @IsNumber()
  @IsOptional()
  holiday: number;

  @IsNumber()
  @IsOptional()
  service: number;

  //Allowance
  @IsNumber()
  @IsOptional()
  go: number;

  @IsNumber()
  @IsOptional()
  home: number;

  @IsNumber()
  @IsOptional()
  toxic: number;

  @IsNumber()
  @IsOptional()
  diligence: number;

  @IsNumber()
  @IsOptional()
  effectively: number;

  @IsNumber()
  @IsOptional()
  eat: number;

  //Insurance
  @IsNumber()
  @IsOptional()
  medican: number;

  @IsNumber()
  @IsOptional()
  society: number;

  @IsNumber()
  @IsOptional()
  unemployment: number;

  @IsNumber()
  @IsOptional()
  union: number;

  @IsNumber()
  @IsOptional()
  accident: number;

  @IsNumber()
  @IsOptional()
  health: number;

  @IsString()
  @IsOptional()
  creator: string;
}
