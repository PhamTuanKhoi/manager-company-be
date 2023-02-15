import { PartialType } from '@nestjs/mapped-types';
import { CreateJoinPartDto } from './create-join-part.dto';

export class UpdateJoinPartDto extends PartialType(CreateJoinPartDto) {}
