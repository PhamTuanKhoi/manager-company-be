import { PartialType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';
import { TaskStatusEnum } from '../interface/task-status.enum';
import { CreateTaskDto } from './create-task.dto';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @IsOptional()
  status: TaskStatusEnum;
}
