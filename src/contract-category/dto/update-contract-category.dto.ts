import { PartialType } from '@nestjs/mapped-types';
import { CreateContractCategoryDto } from './create-contract-category.dto';

export class UpdateContractCategoryDto extends PartialType(
  CreateContractCategoryDto,
) {}
