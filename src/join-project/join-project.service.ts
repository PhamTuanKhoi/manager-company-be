import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateJoinProjectDto } from './dto/create-join-project.dto';
import { UpdateJoinProjectDto } from './dto/update-join-project.dto';
import { JoinProject, JoinProjectDocument } from './schema/join-project.schema';

@Injectable()
export class JoinProjectService {
  private readonly logger = new Logger(JoinProjectService.name);

  constructor(
    @InjectModel(JoinProject.name) private model: Model<JoinProjectDocument>,
  ) {}

  async create(createJoinProjectDto: CreateJoinProjectDto) {
    try {
      const created = await this.model.create(createJoinProjectDto);

      this.logger.log(`created a new join-project by id#${created?._id}`);

      return created;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
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
