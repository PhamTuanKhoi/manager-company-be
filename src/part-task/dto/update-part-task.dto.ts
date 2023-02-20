import { PartialType } from '@nestjs/mapped-types';
import { CreatePartTaskDto } from './create-part-task.dto';

export class UpdatePartTaskDto extends PartialType(CreatePartTaskDto) {}
