import { Injectable } from '@nestjs/common';
import { CreateWorkerProjectDto } from './dto/create-worker-project.dto';
import { UpdateWorkerProjectDto } from './dto/update-worker-project.dto';

@Injectable()
export class WorkerProjectService {
  create(createWorkerProjectDto: CreateWorkerProjectDto) {
    return 'This action adds a new workerProject';
  }

  findAll() {
    return `This action returns all workerProject`;
  }

  findOne(id: number) {
    return `This action returns a #${id} workerProject`;
  }

  update(id: number, updateWorkerProjectDto: UpdateWorkerProjectDto) {
    return `This action updates a #${id} workerProject`;
  }

  remove(id: number) {
    return `This action removes a #${id} workerProject`;
  }
}
