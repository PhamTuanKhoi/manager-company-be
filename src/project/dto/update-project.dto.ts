import { PartialType } from '@nestjs/mapped-types';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { CreateProjectDto } from './create-project.dto';
import { ProjectPriorityEnum } from '../interfaces/priority-enum';
import { ProjectStatusEnum } from '../interfaces/status-enum';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @IsString()
  @IsOptional()
  name: string;

  @IsOptional()
  priority: ProjectPriorityEnum;

  @IsOptional()
  @IsNumber()
  price: number;

  @IsOptional()
  @IsNumber()
  start: number;

  @IsOptional()
  @IsNumber()
  end: number;

  @IsOptional()
  status: ProjectStatusEnum;

  @IsOptional()
  content: [];

  @IsOptional()
  @IsString()
  media: string;

  @IsOptional()
  @IsString()
  creator: string;

  @IsOptional()
  @IsString()
  leader: string;

  // employ
  @IsOptional()
  team: [];

  @IsOptional()
  client: [];

  @IsOptional()
  @IsString()
  payslip: string;
}
