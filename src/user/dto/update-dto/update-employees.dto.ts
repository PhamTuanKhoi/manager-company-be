import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';
import { CreateEmployeeDto } from '../create-dto/create-employee.dto';

export class UpdateEmployeesDto extends PartialType(CreateEmployeeDto) {
  @IsOptional()
  @IsString()
  oldEmail: string;
}
