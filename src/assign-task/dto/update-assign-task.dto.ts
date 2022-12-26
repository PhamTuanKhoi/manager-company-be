import { PartialType } from '@nestjs/mapped-types';
import { CreateAssignTaskDto } from './create-assign-task.dto';

export class UpdateAssignTaskDto extends PartialType(CreateAssignTaskDto) {}
