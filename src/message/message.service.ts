import { Injectable, Logger } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Infor } from './entities/infor.entity';

@Injectable()
export class MessageService {
  infor: Infor[] = [];

  private readonly logger = new Logger('gateway');

  async createInfor(payload: Infor) {
    const exit = this.infor.find((item) => item.userid === payload.userid);

    if (exit && exit.socketid !== payload.socketid) {
      exit.socketid = payload.socketid;

      this.logger.log('find');
      return;
    }

    if (exit && exit.socketid === payload.socketid) {
      this.logger.log('exit');

      return;
    }

    this.infor.push(payload);

    this.logger.log('push infor');
  }

  create(createMessageDto: CreateMessageDto) {
    const to = this.infor.find((item) => item.userid === createMessageDto.to);

    return { to: to?.socketid };
  }

  findAll() {
    return `This action returns all message`;
  }

  findOne(id: number) {
    return `This action returns a #${id} message`;
  }

  update(id: number, updateMessageDto: UpdateMessageDto) {
    return `This action updates a #${id} message`;
  }

  remove(id: number) {
    return `This action removes a #${id} message`;
  }
}
