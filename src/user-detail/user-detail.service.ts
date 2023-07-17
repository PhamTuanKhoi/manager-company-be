import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDetailDto } from './dto/create-user-detail.dto';
import { UpdateUserDetailDto } from './dto/update-user-detail.dto';
import { UserDetail } from './schema/user-detail.schema';

@Injectable()
export class UserDetailService {
  private readonly logger = new Logger(UserDetailService.name);
  constructor(
    @InjectModel(UserDetail.name) private readonly model: Model<UserDetail>,
  ) {}

  findById(id: string) {
    return this.model.findById(id).lean();
  }

  async findByUserId(id: string) {
    return this.model.findOne({ user: id });
  }

  async createOrUpdate(updateUserDetailDto: UpdateUserDetailDto) {
    try {
      const userDetail = await this.findByUserId(updateUserDetailDto?.user);
      if (userDetail && userDetail._id) {
        return await this.update(
          userDetail._id.toString(),
          updateUserDetailDto,
        );
      }

      return this.create(updateUserDetailDto as CreateUserDetailDto);
    } catch (error) {
      this.logger.error(error?.message, error?.stack);
      throw new BadRequestException(error);
    }
  }

  async create(createUserDetailDto: CreateUserDetailDto) {
    try {
      const saved = await this.model.create(createUserDetailDto);
      this.logger.log(`created a new user-detail by id#${saved?._id}`);
      return saved;
    } catch (error) {
      this.logger.error(error?.message, error?.stack);
      throw new BadRequestException(error);
    }
  }

  async update(id: string, updateUserDetailDto: UpdateUserDetailDto) {
    try {
      await this.isModelExist(id);
      const updated = await this.model.findByIdAndUpdate(
        id,
        updateUserDetailDto,
        { new: true },
      );
      this.logger.log(`updated a user-detail by id#${updated?._id}`);
      return updated;
    } catch (error) {
      this.logger.error(error?.message, error?.stack);
      throw new BadRequestException(error);
    }
  }

  async isModelExist(id, isOptional = false, msg = '') {
    if (isOptional && !id) return;
    const errorMessage = msg || `id-> ${UserDetail.name} not found`;
    const isExist = await this.findById(id);

    if (!isExist) throw new Error(errorMessage);
    return isExist;
  }
}
