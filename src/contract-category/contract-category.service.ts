import { Injectable } from '@nestjs/common';
import { CreateContractCategoryDto } from './dto/create-contract-category.dto';
import { UpdateContractCategoryDto } from './dto/update-contract-category.dto';

@Injectable()
export class ContractCategoryService {
  create(createContractCategoryDto: CreateContractCategoryDto) {
    return 'This action adds a new contractCategory';
  }

  findAll() {
    return `This action returns all contractCategory`;
  }

  findOne(id: number) {
    return `This action returns a #${id} contractCategory`;
  }

  update(id: number, updateContractCategoryDto: UpdateContractCategoryDto) {
    return `This action updates a #${id} contractCategory`;
  }

  remove(id: number) {
    return `This action removes a #${id} contractCategory`;
  }
}
