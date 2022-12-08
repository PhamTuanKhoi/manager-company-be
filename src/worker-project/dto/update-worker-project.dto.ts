import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkerProjectDto } from './create-worker-project.dto';

export class UpdateWorkerProjectDto extends PartialType(CreateWorkerProjectDto) {}
