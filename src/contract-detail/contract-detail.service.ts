import { Injectable } from '@nestjs/common';
import { CreateUserDetailDto } from 'src/user-detail/dto/create-user-detail.dto';
import { CreateClientDto } from 'src/user/dto/create-dto/create-client.dto';
import { CreateWorkerDto } from 'src/user/dto/create-dto/create-worker.dto';
import { UpdateClientDto } from 'src/user/dto/update-dto/update-client.dto';
import { UpdateWorkerDto } from 'src/user/dto/update-dto/update-worker.dto';
import { CreateContractDetailDto } from './dto/create-contract-detail.dto';
import { UpdateContractDetailDto } from './dto/update-contract-detail.dto';

@Injectable()
export class ContractDetailService {
  async create(createContractDetailDto: CreateContractDetailDto) {
    console.log(createContractDetailDto);
    const client: UpdateClientDto = createContractDetailDto.client;
    const clientDetail: CreateUserDetailDto = {
      ...createContractDetailDto.client,
    };

    const worker: Omit<UpdateWorkerDto, 'password' | 'confirmPasword'> =
      createContractDetailDto.worker;
    const workerDetail: CreateUserDetailDto = {
      ...createContractDetailDto.worker,
    };

    // return 'This action adds a new contractDetail';
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
