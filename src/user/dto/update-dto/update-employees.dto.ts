import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeeDto } from '../create-dto/create-employee.dto';

export class UpdateEmployeesDto extends PartialType(CreateEmployeeDto) {}
