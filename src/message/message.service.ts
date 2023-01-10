import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MessageApiService } from 'src/message-api/message-api.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Infor } from './entities/infor.entity';

@Injectable()
export class MessageService {
  infor: Infor[] = [];

  private readonly logger = new Logger('gateway');

  constructor(
    @Inject(forwardRef(() => MessageApiService))
    private messageApiService: MessageApiService,
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
    try {
      const to = this.infor.find((item) => item.userid === createMessageDto.to);

      this.messageApiService.create(createMessageDto);

      return { to: to?.socketid };
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
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
