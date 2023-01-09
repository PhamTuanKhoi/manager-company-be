import { Injectable } from '@nestjs/common';
import { CreateMessageApiDto } from './dto/create-message-api.dto';
import { UpdateMessageApiDto } from './dto/update-message-api.dto';

@Injectable()
export class MessageApiService {
  create(createMessageApiDto: CreateMessageApiDto) {
    return 'This action adds a new messageApi';
  }

  findAll() {
    return `This action returns all messageApi`;
  }

  findOne(id: number) {
    return `This action returns a #${id} messageApi`;
  }

  update(id: number, updateMessageApiDto: UpdateMessageApiDto) {
    return `This action updates a #${id} messageApi`;
  }

  remove(id: number) {
    return `This action removes a #${id} messageApi`;
  }
}
