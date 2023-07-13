import { PartialType } from '@nestjs/mapped-types';
import { CreateContractDetailDto } from './create-contract-detail.dto';

export class UpdateContractDetailDto extends PartialType(CreateContractDetailDto) {}
