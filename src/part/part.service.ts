import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { ProjectService } from 'src/project/project.service';
import { UserService } from 'src/user/user.service';
import { CreatePartDto } from './dto/create-part.dto';
import { QueryPartDto } from './dto/query-part.dto';
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

  // not use
  async checkNotTask(queryPartDto: QueryPartDto) {
    const data = await this.model.aggregate([
      {
        $match: {
          $expr: {
            $eq: ['$project', { $toObjectId: queryPartDto.project }],
          },
        },
      },
      {
        $unwind: { path: '$tasks', preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          _id: '$_id',
          name: '$name',
          tasks: {
            $cond: {
              if: { $eq: [{ $toObjectId: queryPartDto.task }, '$tasks'] },
              then: '$tasks',
              else: '$$REMOVE',
            },
          },
        },
      },
      {
        $group: {
          _id: {
            _id: '$_id',
            name: '$name',
          },
          tasks: {
            $push: '$tasks',
          },
        },
      },
      {
        $project: {
          _id: '$_id._id',
          name: '$_id.name',
          tasks: '$tasks',
        },
      },
    ]);

    return data?.filter((item) => item.tasks.length === 0);
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
      {
        $lookup: {
          from: 'users',
          localField: 'workers',
          foreignField: '_id',
          pipeline: [
            {
              $project: {
                _id: '$_id',
                userId: '$_id',
                name: '$name',
                filed: '$field',
                avartar: '$avartar',
              },
            },
          ],
          as: 'userEX',
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
        (item) => item?.toString() === userId,
      );

      if (checkUserId) {
        this.logger.log(`user have in array workers`);
        return;
      }

      const updated = await this.model.findByIdAndUpdate(
        id,
        {
          workers: [...isExist.workers, userId],
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

  async updateFiledTask(id: string, task: string) {
    try {
      const isExits = await this.isModelExit(id);

      const updated = await this.model.findByIdAndUpdate(
        id,
        {
          tasks: [...isExits.tasks, task],
        },
        { new: true },
      );

      this.logger.log(`updated a part by id#${updated?._id}`);

      return updated;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }
}
