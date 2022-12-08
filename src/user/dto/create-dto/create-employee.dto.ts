import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { EmployeeDepartmentEnum } from 'src/gobal/department-employess.enum';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsNumber()
  @IsNotEmpty()
  cccd: number;

  @IsNotEmpty()
  department: EmployeeDepartmentEnum;

  @IsNumber()
  @IsNotEmpty()
  mobile: number;

  @IsNumber()
  @IsNotEmpty()
  date: number;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsOptional()
  avartar: string;
}
