import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProjectService } from 'src/project/project.service';
import { UserService } from 'src/user/user.service';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';
import { Part, PartDocument } from './schema/part.schema';

@Injectable()
export class PartService {
  private readonly logger = new Logger(Part.name);

  constructor(
    @InjectModel(Part.name) private model: Model<PartDocument>,
    @Inject(forwardRef(() => ProjectService))
    private projectService: ProjectService,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}

  async create(createPartDto: CreatePartDto) {
    try {
      await Promise.all([
        this.projectService.isModelExist(createPartDto.project),
        this.userService.isModelExist(createPartDto.creator),
      ]);

      const created = await this.model.create(createPartDto);

      this.logger.log(`created a new part by id#${created?._id}`);

      return created;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async findOne(id: string) {
    return this.model.findById(id).lean();
  }

  async isModelExit(id, isOptional = false, msg = '') {
    if (isOptional && !id) return;
    const message = msg || `id ${Part.name} not found`;
    const isExit = await this.findOne(id);
    if (!isExit) throw new Error(message);
    return isExit;
  }

  async findByIdProject(id: string) {
    return this.model.aggregate([
      {
        $match: {
          $expr: {
            $eq: ['$project', { $toObjectId: id }],
          },
        },
      },
    ]);
  }

  async updateFieldWorkers(id: string, updatePartDto: UpdatePartDto) {
    try {
      const { userId } = updatePartDto;

      // check input data
      const isExist: any = await this.isModelExit(id);

      await this.userService.isModelExist(updatePartDto.userId);

      const checkUserId = isExist.workers?.find(
        (item) => item?.userId?.toString() === userId,
      );

      if (checkUserId) {
        this.logger.log(`user have in array workers`);
        return;
      }

      const updated = await this.model.findByIdAndUpdate(
        id,
        {
          workers: [
            ...isExist.workers,
            {
              userId,
              date: Date.now(),
            },
          ],
        },
        { new: true },
      );

      this.logger.log(`updated field part by id #${updated?._id}`);

      return updated;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }
}
