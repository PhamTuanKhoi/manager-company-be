import { Injectable } from '@nestjs/common';
import { CreateEmployProjectDto } from './dto/create-employ-project.dto';
import { UpdateEmployProjectDto } from './dto/update-employ-project.dto';

@Injectable()
export class EmployProjectService {
  create(createEmployProjectDto: CreateEmployProjectDto) {
    return 'This action adds a new employProject';
  }

  findAll() {
    return `This action returns all employProject`;
  }

  findOne(id: number) {
    return `This action returns a #${id} employProject`;
  }

  update(id: number, updateEmployProjectDto: UpdateEmployProjectDto) {
    return `This action updates a #${id} employProject`;
  }

  remove(id: number) {
    return `This action removes a #${id} employProject`;
  }
}
