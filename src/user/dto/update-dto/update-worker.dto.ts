import { PartialType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';
import { CreateWorkerDto } from '../create-dto/create-worker.dto';

export class UpdateWorkerDto extends PartialType(CreateWorkerDto) {
  @IsOptional()
  oldEmail?: string;
}
