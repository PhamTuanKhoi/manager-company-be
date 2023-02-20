import { Injectable } from '@nestjs/common';
import { CreatePartTaskDto } from './dto/create-part-task.dto';
import { UpdatePartTaskDto } from './dto/update-part-task.dto';

@Injectable()
export class PartTaskService {
  create(createPartTaskDto: CreatePartTaskDto) {
    return 'This action adds a new partTask';
  }

  findAll() {
    return `This action returns all partTask`;
  }

  findOne(id: number) {
    return `This action returns a #${id} partTask`;
  }

  update(id: number, updatePartTaskDto: UpdatePartTaskDto) {
    return `This action updates a #${id} partTask`;
  }

  remove(id: number) {
    return `This action removes a #${id} partTask`;
  }
}
