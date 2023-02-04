import {
  BadRequestException,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TaskService } from 'src/task/task.service';
import { UserRoleEnum } from 'src/user/interfaces/role-user.enum';
import { UserService } from 'src/user/user.service';
import { CreateAssignTaskDto } from './dto/create-assign-task.dto';
import { UpdateAssignTaskDto } from './dto/update-assign-task.dto';
import { AssignTask, AssignTaskDocument } from './schema/assign-task.schema';

@Injectable()
export class AssignTaskService {
  private readonly logger = new Logger(AssignTask.name);

  constructor(
    @InjectModel(AssignTask.name) private model: Model<AssignTaskDocument>,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    @Inject(forwardRef(() => TaskService))
    private taskService: TaskService,
  ) {}

  async list() {
    return await this.model.find();
  }

  async findOne(id: string) {
    return await this.model.findById(id).lean();
  }

  async performTrueByIdProject(id: string) {
    return await this.model.aggregate([
      {
        $match: {
          'perform.status': true,
        },
      },
      {
        $lookup: {
          from: 'tasks',
          localField: 'task',
          foreignField: '_id',
          pipeline: [
            {
              $lookup: {
                from: 'projects',
                localField: 'project',
                foreignField: '_id',
                as: 'projectEX',
              },
            },
            {
              $unwind: '$projectEX',
            },
            {
              $match: {
                $expr: {
                  $eq: ['$projectEX._id', { $toObjectId: id }],
                },
              },
            },
          ],
          as: 'taskEX',
        },
      },
      {
        $unwind: '$taskEX',
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
          _id: '$_id',
          perform: '$perform',
          taskId: '$task',
          taskName: '$taskEX.name',
          userId: '$worker',
          name: '$user.name',
          field: '$user.field',
        },
      },
    ]);
  }

  async finishTrueByIdProject(id: string) {
    return await this.model.aggregate([
      {
        $match: {
          'finish.status': true,
        },
      },
      {
        $lookup: {
          from: 'tasks',
          localField: 'task',
          foreignField: '_id',
          pipeline: [
            {
              $lookup: {
                from: 'projects',
                localField: 'project',
                foreignField: '_id',
                as: 'projectEX',
              },
            },
            {
              $unwind: '$projectEX',
            },
            {
              $match: {
                $expr: {
                  $eq: ['$projectEX._id', { $toObjectId: id }],
                },
              },
            },
          ],
          as: 'taskEX',
        },
      },
      {
        $unwind: '$taskEX',
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
          _id: '$_id',
          finish: '$finish',
          taskId: '$task',
          taskName: '$taskEX.name',
          userId: '$worker',
          name: '$user.name',
          field: '$user.field',
        },
      },
    ]);
  }

  async precentFinishTrueByIdProject(id: string) {
    const data = await this.model.aggregate([
      {
        $lookup: {
          from: 'tasks',
          localField: 'task',
          foreignField: '_id',
          pipeline: [
            {
              $lookup: {
                from: 'projects',
                localField: 'project',
                foreignField: '_id',
                as: 'projectEX',
              },
            },
            {
              $unwind: '$projectEX',
            },
            {
              $match: {
                $expr: {
                  $eq: ['$projectEX._id', { $toObjectId: id }],
                },
              },
            },
          ],
          as: 'taskEX',
        },
      },
      {
        $unwind: '$taskEX',
      },
      {
        $addFields: {
          group: 'this is for grouping',
        },
      },
      {
        $group: {
          _id: {
            finish: '$finish.status',
            group: '$group',
          },
          total: {
            $sum: 1,
          },
        },
      },
      {
        $project: {
          _id: 0,
          group: '$_id.group',
          total: '$total',
          true: {
            $cond: {
              if: { $eq: [true, '$_id.finish'] },
              then: '$total',
              else: 0,
            },
          },
        },
      },
      {
        $group: {
          _id: '$group',
          total: {
            $sum: '$total',
          },
          true: {
            $sum: '$true',
          },
        },
      },
      {
        $project: {
          _id: 0,
          precent: {
            $round: [
              {
                $multiply: [
                  {
                    $divide: ['$true', '$total'],
                  },
                  100,
                ],
              },
              2,
            ],
          },
        },
      },
    ]);

    return data;
  }

  async taskPerformTrueByIdProject(id: string) {
    return await this.model.aggregate([
      {
        $lookup: {
          from: 'tasks',
          localField: 'task',
          foreignField: '_id',
          pipeline: [
            {
              $lookup: {
                from: 'projects',
                localField: 'project',
                foreignField: '_id',
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ['$_id', { $toObjectId: id }],
                      },
                    },
                  },
                ],
                as: 'projectEX',
              },
            },
            {
              $unwind: '$projectEX',
            },
          ],
          as: 'taskEX',
        },
      },
      {
        $unwind: '$taskEX',
      },
      {
        $group: {
          _id: {
            taskId: '$taskEX._id',
            taskName: '$taskEX.name',
            perform: '$perform.status',
          },
          total: {
            $sum: 1,
          },
        },
      },
      {
        $project: {
          _id: 0,
          taskId: '$_id.taskId',
          taskName: '$_id.taskName',
          total: '$total',
          true: {
            $cond: {
              if: { $eq: [true, '$_id.perform'] },
              then: '$total',
              else: 0,
            },
          },
        },
      },
      {
        $group: {
          _id: {
            taskId: '$taskId',
            taskName: '$taskName',
          },
          true: {
            $sum: '$true',
          },
          total: {
            $sum: '$total',
          },
        },
      },
      {
        $project: {
          _id: 0,
          taskId: '$_id.taskId',
          taskName: '$_id.taskName',
          true: '$true',
          total: '$total',
          precent: {
            // rounding position 2
            $round: [
              {
                // mul 100
                $multiply: [
                  {
                    // true / total
                    $divide: ['$true', '$total'],
                  },
                  100,
                ],
              },
              2,
            ],
          },
        },
      },
    ]);
  }

  async taskFinishTrueByIdProject(id: string) {
    return await this.model.aggregate([
      {
        $lookup: {
          from: 'tasks',
          localField: 'task',
          foreignField: '_id',
          pipeline: [
            {
              $lookup: {
                from: 'projects',
                localField: 'project',
                foreignField: '_id',
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ['$_id', { $toObjectId: id }],
                      },
                    },
                  },
                ],
                as: 'projectEX',
              },
            },
            {
              $unwind: '$projectEX',
            },
          ],
          as: 'taskEX',
        },
      },
      {
        $unwind: '$taskEX',
      },
      {
        $group: {
          _id: {
            taskId: '$task',
            taskName: '$taskEX.name',
            finish: '$finish.status',
          },
          total: {
            $sum: 1,
          },
        },
      },
      {
        $project: {
          _id: 0,
          taskId: '$_id.taskId',
          taskName: '$_id.taskName',
          true: {
            $cond: {
              if: { $eq: [true, '$_id.finish'] },
              then: '$total',
              else: 0,
            },
          },
          total: '$total',
        },
      },
      {
        $group: {
          _id: {
            taskId: '$taskId',
            taskName: '$taskName',
          },
          true: {
            $sum: '$true',
          },
          total: {
            $sum: '$total',
          },
        },
      },
      {
        $project: {
          _id: 0,
          taskId: '$_id.taskId',
          taskName: '$_id.taskName',
          true: '$true',
          total: '$total',
          precent: {
            // rounding position 2
            $round: [
              {
                // mul 100
                $multiply: [
                  {
                    // true / total
                    $divide: ['$true', '$total'],
                  },
                  100,
                ],
              },
              2,
            ],
          },
        },
      },
    ]);
  }

  async findByTask(id: string) {
    return this.model.aggregate([
      {
        $match: {
          $expr: {
            $eq: ['$task', { $toObjectId: id }],
          },
        },
      },
    ]);
  }

  async findByProject(id: string) {
    const data = await this.model.aggregate([
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
        $lookup: {
          from: 'tasks',
          localField: 'task',
          foreignField: '_id',
          pipeline: [
            {
              $lookup: {
                from: 'projects',
                localField: 'project',
                foreignField: '_id',
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ['$_id', { $toObjectId: id }],
                      },
                    },
                  },
                ],
                as: 'projectEX',
              },
            },
            {
              $unwind: '$projectEX',
            },
          ],
          as: 'task',
        },
      },
      {
        $unwind: '$task',
      },
      {
        $project: {
          _id: '$_id',
          userId: '$user._id',
          name: '$user.name',
          avartar: '$user.avartar',
          field: '$user.field',
          taskId: '$task._id',
          taskName: '$task.name',
          perform: '$perform',
          finish: '$finish',
        },
      },
    ]);

    return data;
  }

  async create(createAssignTaskDto: CreateAssignTaskDto) {
    try {
      //check user
      const isWorkerExits = await this.userService.isModelExist(
        createAssignTaskDto.worker,
      );

      if (isWorkerExits.role !== UserRoleEnum.WORKER)
        throw new HttpException(
          `nguời được giao không phải ngườii lao động`,
          HttpStatus.BAD_REQUEST,
        );

      // check task
      await this.taskService.isExitModel(createAssignTaskDto.task);

      const created = await this.model.create(createAssignTaskDto);

      this.logger.log(`created a new assign task by id #${created?._id}`);

      return created;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async createByPart(createAssignTaskDto: CreateAssignTaskDto) {
    console.log(createAssignTaskDto);
  }

  async updatePerform(id: string, updatePerform: { verify: boolean }) {
    try {
      await this.isModelExist(id);

      const verify = await this.model.findByIdAndUpdate(
        id,
        {
          'perform.status': updatePerform.verify,
          'perform.date': Date.now(),
        },
        {
          new: true,
        },
      );

      this.logger.log(`verify perform success by id#${verify?._id}`);

      return verify;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async updateFinish(id: string, updateFinish: { verify: boolean }) {
    try {
      await this.isModelExist(id);

      const verify = await this.model.findByIdAndUpdate(
        id,
        { finish: { status: updateFinish.verify, date: Date.now() } },
        {
          new: true,
        },
      );

      this.logger.log(`verify perform success by id#${verify?._id}`);

      return verify;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} assignTask`;
  }

  async isModelExist(id, isOptional = false, msg = '') {
    if (isOptional && !id) return;
    const errorMessage = msg || `id-> ${AssignTask.name} not found`;
    const isExist = await this.findOne(id);
    if (!isExist) throw new Error(errorMessage);
  }
}
