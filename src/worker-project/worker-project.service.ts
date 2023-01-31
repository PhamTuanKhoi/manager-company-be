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
import { CreateWorkerProjectDto } from './dto/create-worker-project.dto';
import { QueryWorkerProjectDto } from './dto/query-worker-project.dto';
import {
  WorkerProject,
  WorkerProjectDocument,
} from './schema/worker-project.shema';

@Injectable()
export class WorkerProjectService {
  private readonly logger = new Logger(WorkerProjectService.name);

  constructor(
    @InjectModel(WorkerProject.name)
    private model: Model<WorkerProjectDocument>,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    @Inject(forwardRef(() => ProjectService))
    private projectService: ProjectService,
  ) {}

  async create(createWorkerProjectDto: CreateWorkerProjectDto) {
    try {
      // check user
      await this.userService.isModelExist(createWorkerProjectDto.worker);

      // check project
      await this.projectService.isModelExist(createWorkerProjectDto.project);

      const created = await this.model.create(createWorkerProjectDto);

      this.logger.log(`created a new worker-project by id #${created?._id}`);

      return created;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async isModelExist(id, isOptional = false, msg = '') {
    if (isOptional && !id) return;
    const errorMessage = msg || `id-> ${WorkerProject.name} not found`;
    const isExist = await this.findOne(id);
    if (!isExist) throw new Error(errorMessage);
  }

  findOne(id: string) {
    return this.model.findById(id);
  }

  async findByProject(id: string) {
    const data = await this.model.aggregate([
      {
        $match: {
          $expr: {
            $eq: ['$project', { $toObjectId: id }],
          },
        },
      },
      {
        $lookup: {
          from: 'projects',
          localField: 'project',
          foreignField: '_id',
          pipeline: [
            {
              $lookup: {
                from: 'tasks',
                localField: '_id',
                foreignField: 'project',
                as: 'tasks',
              },
            },
          ],
          as: 'projectEX',
        },
      },
      {
        $unwind: '$projectEX',
      },
      {
        $lookup: {
          from: 'users',
          localField: 'worker',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
    ]);

    return data;
  }

  async checkAssignTask(queryWorkerProjectDto: QueryWorkerProjectDto) {
    const { project, task } = queryWorkerProjectDto;

    return await this.model.aggregate([
      {
        $match: {
          $expr: {
            $eq: ['$project', { $toObjectId: project }],
          },
        },
      },
      {
        $lookup: {
          from: 'assigntasks',
          let: { worked: '$worker' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$worker', '$$worked'] },
              },
            },
          ],
          as: 'assign',
        },
      },
      { $unwind: { path: '$assign', preserveNullAndEmptyArrays: true } },
      {
        $match: {
          $expr: {
            $ne: ['$assign.task', { $toObjectId: task }],
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'worker',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          _id: '$user._id',
          name: '$user.name',
          avartar: '$user.avartar',
        },
      },
    ]);
  }
}
