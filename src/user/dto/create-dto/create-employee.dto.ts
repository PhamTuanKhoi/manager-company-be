import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { PersonalInfor } from 'src/gobal/personal-infor';
import { EmployeeDepartmentEnum } from 'src/user/interfaces/department-employess.enum';

export class CreateEmployeeDto extends PersonalInfor {
  @IsNotEmpty()
  department: string;
}
