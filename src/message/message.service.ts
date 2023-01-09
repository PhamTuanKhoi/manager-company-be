import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Infor } from './entities/infor.entity';
import { Message, MessageDocument } from './schema/message.schema';

@Injectable()
export class MessageService {
  infor: Infor[] = [];

  private readonly logger = new Logger('gateway');

  constructor(
    @InjectModel(Message.name) private model: Model<MessageDocument>,
  ) {}

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

  async create(createMessageDto: CreateMessageDto) {
    const to = this.infor.find((item) => item.userid === createMessageDto.to);

    const created = await this.model.create({
      ...createMessageDto,
      users: [createMessageDto.from, createMessageDto.to],
    });

    this.logger.log(`created a message by id #${created?._id}`);

    return { to: to?.socketid };
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
