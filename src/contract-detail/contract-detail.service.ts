import { Injectable } from '@nestjs/common';
import { CreateContractDetailDto } from './dto/create-contract-detail.dto';
import { UpdateContractDetailDto } from './dto/update-contract-detail.dto';

@Injectable()
export class ContractDetailService {
  create(createContractDetailDto: CreateContractDetailDto) {
    return 'This action adds a new contractDetail';
  }

  findAll() {
    return `This action returns all contractDetail`;
  }

  findOne(id: number) {
    return `This action returns a #${id} contractDetail`;
  }

  update(id: number, updateContractDetailDto: UpdateContractDetailDto) {
    return `This action updates a #${id} contractDetail`;
  }

  remove(id: number) {
    return `This action removes a #${id} contractDetail`;
  }
}
