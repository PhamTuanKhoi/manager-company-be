import { Injectable } from '@nestjs/common';
import { CreateClientProjectDto } from './dto/create-client-project.dto';
import { UpdateClientProjectDto } from './dto/update-client-project.dto';

@Injectable()
export class ClientProjectService {
  create(createClientProjectDto: CreateClientProjectDto) {
    return 'This action adds a new clientProject';
  }

  findAll() {
    return `This action returns all clientProject`;
  }

  findOne(id: number) {
    return `This action returns a #${id} clientProject`;
  }

  update(id: number, updateClientProjectDto: UpdateClientProjectDto) {
    return `This action updates a #${id} clientProject`;
  }

  remove(id: number) {
    return `This action removes a #${id} clientProject`;
  }
}
