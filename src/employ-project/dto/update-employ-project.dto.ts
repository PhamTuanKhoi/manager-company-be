import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployProjectDto } from './create-employ-project.dto';

export class UpdateEmployProjectDto extends PartialType(CreateEmployProjectDto) {}
