import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserService } from 'src/user/user.service';
import { CreateMessageApiDto } from './dto/create-message-api.dto';
import { QueryMessageApiDto } from './dto/query-message-api.dto';
import { UpdateMessageApiDto } from './dto/update-message-api.dto';
import { MessageApi, MessageApiDocument } from './schema/message-api.schema';

@Injectable()
export class MessageApiService {
  private readonly logger = new Logger(MessageApiService.name);

  constructor(
    @InjectModel(MessageApi.name) private model: Model<MessageApiDocument>,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}

  async create(createMessageApiDto: CreateMessageApiDto) {
    try {
      const { from, to } = createMessageApiDto;

      await Promise.all([
        this.userService.isModelExist(from),
        this.userService.isModelExist(to),
      ]);

      const created = await this.model.create({
        ...createMessageApiDto,
        users: [from, to],
      });

      this.logger.log(`created a message by id #${created?._id}`);

      return created;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  findAll(queryMessageApiDto: QueryMessageApiDto) {
    try {
      const { from, to } = queryMessageApiDto;

      return this.model
        .find({
          users: {
            $all: [from, to],
          },
        })
        .sort({ createdAt: 1 });
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
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
