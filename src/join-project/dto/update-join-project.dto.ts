import { PartialType } from '@nestjs/mapped-types';
import { CreateJoinProjectDto } from './create-join-project.dto';

export class UpdateJoinProjectDto extends PartialType(CreateJoinProjectDto) {}
