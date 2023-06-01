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

  async create(createMessageDto: CreateMessageDto) {
    try {
      await this.messageApiService.create(createMessageDto);

      return true;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }
}
