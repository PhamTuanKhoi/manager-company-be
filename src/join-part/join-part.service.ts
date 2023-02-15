import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PartService } from 'src/part/part.service';
import { UserService } from 'src/user/user.service';
import { CreateJoinPartDto } from './dto/create-join-part.dto';
import { UpdateJoinPartDto } from './dto/update-join-part.dto';
import { JoinPart, JoinPartDocument } from './schema/join-part.schema';

@Injectable()
export class JoinPartService {
  private readonly logger = new Logger(JoinPartService.name);

  constructor(
    @InjectModel(JoinPart.name) private model: Model<JoinPartDocument>,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    @Inject(forwardRef(() => PartService))
    private partService: PartService,
  ) {}

  async create(createJoinPartDto: CreateJoinPartDto) {
    try {
      // check input data
      await Promise.all([
        this.userService.isModelExist(createJoinPartDto.joinor),
        this.partService.isModelExit(createJoinPartDto.part),
      ]);

      const created = await this.model.create(createJoinPartDto);

      this.logger.log(`created a new join-part by id#${created?._id}`);

      return created;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
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
