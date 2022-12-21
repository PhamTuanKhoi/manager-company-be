import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { EmployeeDepartmentEnum } from 'src/user/interfaces/department-employess.enum';
import { ProjectPriorityEnum } from './interfaces/priority-enum';
import { ProjectStatusEnum } from './interfaces/status-enum';

export class CreateProjectDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsOptional()
  priority: ProjectPriorityEnum;

  @IsOptional()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsNumber()
  start: number;

  @IsNotEmpty()
  @IsNumber()
  end: number;

  @IsNotEmpty()
  status: ProjectStatusEnum;

  @IsOptional()
  content: [];

  @IsOptional()
  @IsString()
  media: string;

  @IsNotEmpty()
  @IsString()
  creator: string;

  // employ
  @IsNotEmpty()
  team: [];

  @IsNotEmpty()
  client: [];
}