import { Injectable } from '@nestjs/common';
import { CreateJoinProjectDto } from './dto/create-join-project.dto';
import { UpdateJoinProjectDto } from './dto/update-join-project.dto';

@Injectable()
export class JoinProjectService {
  create(createJoinProjectDto: CreateJoinProjectDto) {
    return 'This action adds a new joinProject';
  }

  findAll() {
    return `This action returns all joinProject`;
  }

  findOne(id: number) {
    return `This action returns a #${id} joinProject`;
  }

  update(id: number, updateJoinProjectDto: UpdateJoinProjectDto) {
    return `This action updates a #${id} joinProject`;
  }

  remove(id: number) {
    return `This action removes a #${id} joinProject`;
  }
}
