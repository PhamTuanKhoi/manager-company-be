import { Injectable } from '@nestjs/common';
import { CreateJoinPartDto } from './dto/create-join-part.dto';
import { UpdateJoinPartDto } from './dto/update-join-part.dto';

@Injectable()
export class JoinPartService {
  create(createJoinPartDto: CreateJoinPartDto) {
    return 'This action adds a new joinPart';
  }

  findAll() {
    return `This action returns all joinPart`;
  }

  findOne(id: number) {
    return `This action returns a #${id} joinPart`;
  }

  update(id: number, updateJoinPartDto: UpdateJoinPartDto) {
    return `This action updates a #${id} joinPart`;
  }

  remove(id: number) {
    return `This action removes a #${id} joinPart`;
  }
}
