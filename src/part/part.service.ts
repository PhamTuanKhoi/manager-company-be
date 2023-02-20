import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { AssignTaskService } from 'src/assign-task/assign-task.service';
import { AssignTask } from 'src/assign-task/schema/assign-task.schema';
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
    @Inject(forwardRef(() => AssignTaskService))
    private assignTaskService: AssignTaskService,
  ) {}

  async create(createPartDto: CreatePartDto) {
    try {
      const { project, creator, heador, parent } = createPartDto;

      const checkInput = [
        this.projectService.isModelExist(project),
        this.userService.isModelExist(creator),
        this.userService.isModelExist(heador),
      ];

      // check input data
      await Promise.all(
        parent ? [...checkInput, this.isModelExit(parent)] : checkInput,
      );

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

  // not use
  async checkNotTask(queryPartDto: QueryPartDto) {
    return await this.model.aggregate([
      {
        $match: {
          $expr: {
            $eq: ['$project', { $toObjectId: queryPartDto.project }],
          },
        },
      },
      {
        $lookup: {
          from: 'parttasks',
          localField: '_id',
          foreignField: 'part',
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$task', { $toObjectId: queryPartDto.task }],
                },
              },
            },
          ],
          as: 'parttaskEX',
        },
      },
      {
        $addFields: {
          size: {
            $size: '$parttaskEX',
          },
        },
      },
      {
        $match: {
          size: 0,
        },
      },
      {
        $match: {
          parent: {
            $exists: false,
          },
        },
      },
    ]);
  }

  async findPartByIdPartAndProject(queryPartDto: QueryPartDto) {
    return this.model.aggregate([
      {
        $match: {
          $expr: {
            $eq: ['$project', { $toObjectId: queryPartDto.project }],
          },
        },
      },
      {
        $match: {
          $expr: {
            $eq: ['$parent', { $toObjectId: queryPartDto.part }],
          },
        },
      },
      {
        $lookup: {
          from: 'parttasks',
          localField: '_id',
          foreignField: 'part',
          as: 'parttaskEX',
        },
      },
      {
        $addFields: {
          size: {
            $size: '$parttaskEX',
          },
        },
      },
      {
        $match: {
          parent: {
            $exists: true,
          },
        },
      },
      {
        $lookup: {
          from: 'joinparts',
          localField: '_id',
          foreignField: 'part',
          pipeline: [
            {
              $lookup: {
                from: 'users',
                localField: 'joinor',
                foreignField: '_id',
                as: 'userEX',
              },
            },
            {
              $unwind: '$userEX',
            },
            {
              $project: {
                _id: 0,
                joinpartId: '$_id',
                userId: '$userEX._id',
                name: '$userEX.name',
                field: '$userEX.field',
              },
            },
          ],
          as: 'joinpartEX',
        },
      },
      {
        $addFields: {
          sizeJoinPart: {
            $size: '$joinpartEX',
          },
        },
      },
      {
        $lookup: {
          from: 'parts',
          localField: '_id',
          foreignField: 'parent',
          as: 'childEX',
        },
      },
      {
        $addFields: {
          sizeChild: {
            $size: '$childEX',
          },
        },
      },
      {
        $project: {
          name: '$name',
          project: '$project',
          heador: '$heador',
          size: '$size',
          sizeJoinPart: '$sizeJoinPart',
          sizeChild: '$sizeChild',
          joinpartEX: '$joinpartEX',
        },
      },
    ]);
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
          from: 'parttasks',
          localField: '_id',
          foreignField: 'part',
          as: 'parttaskEX',
        },
      },
      {
        $addFields: {
          size: {
            $size: '$parttaskEX',
          },
        },
      },
      {
        $match: {
          parent: {
            $exists: false,
          },
        },
      },
      {
        $lookup: {
          from: 'joinparts',
          localField: '_id',
          foreignField: 'part',
          pipeline: [
            {
              $lookup: {
                from: 'users',
                localField: 'joinor',
                foreignField: '_id',
                as: 'userEX',
              },
            },
            {
              $unwind: '$userEX',
            },
            {
              $project: {
                _id: 0,
                joinpartId: '$_id',
                userId: '$userEX._id',
                name: '$userEX.name',
                field: '$userEX.field',
              },
            },
          ],
          as: 'joinpartEX',
        },
      },
      {
        $addFields: {
          sizeJoinPart: {
            $size: '$joinpartEX',
          },
        },
      },
      {
        $lookup: {
          from: 'parts',
          localField: '_id',
          foreignField: 'parent',
          as: 'childEX',
        },
      },
      {
        $addFields: {
          sizeChild: {
            $size: '$childEX',
          },
        },
      },
      {
        $project: {
          name: '$name',
          project: '$project',
          heador: '$heador',
          size: '$size',
          sizeJoinPart: '$sizeJoinPart',
          sizeChild: '$sizeChild',
          joinpartEX: '$joinpartEX',
        },
      },
    ]);
  }

  async precent(queryPartDto: QueryPartDto) {
    const data = await this.model.aggregate([
      {
        $match: {
          $expr: {
            $eq: ['$project', { $toObjectId: queryPartDto.project }],
          },
        },
      },
      {
        $unwind: { path: '$workers', preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: 'tasks',
          localField: 'tasks',
          foreignField: '_id',
          as: 'taskEX',
        },
      },
      {
        $unwind: { path: '$taskEX', preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: 'assigntasks',
          localField: 'taskEX._id',
          foreignField: 'task',
          as: 'assignTask',
        },
      },
      {
        $unwind: '$assignTask',
      },
      {
        $match: {
          $expr: {
            $eq: ['$workers', '$assignTask.worker'],
          },
        },
      },
      {
        $project: {
          _id: '$_id',
          name: '$name',
          performTrue: {
            $cond: {
              if: { $eq: [true, '$assignTask.perform.status'] },
              then: 1,
              else: 0,
            },
          },
          finishTrue: {
            $cond: {
              if: { $eq: [true, '$assignTask.finish.status'] },
              then: 1,
              else: 0,
            },
          },
          total: {
            $sum: 1,
          },
        },
      },
      {
        $group: {
          _id: {
            _id: '$_id',
            name: '$name',
          },
          total: {
            $sum: '$total',
          },
          performTrue: {
            $sum: '$performTrue',
          },
          finishTrue: {
            $sum: '$finishTrue',
          },
        },
      },
      {
        $project: {
          _id: '$_id._id',
          name: '$_id.name',
          performTrue: '$performTrue',
          finishTrue: '$finishTrue',
          precentPerform: {
            $round: [
              {
                $multiply: [
                  {
                    $divide: ['$performTrue', '$total'],
                  },
                  100,
                ],
              },
              2,
            ],
          },
          precentFinish: {
            $round: [
              {
                $multiply: [
                  {
                    $divide: ['$finishTrue', '$total'],
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

  // async updateFieldWorkers(id: string, updatePartDto: UpdatePartDto) {
  //   try {
  //     const { userId } = updatePartDto;

  //     // check input data
  //     const isExist: any = await this.isModelExit(id);

  //     await this.userService.isModelExist(updatePartDto.userId);

  //     const checkUserId = isExist.workers?.find(
  //       (item) => item?.toString() === userId,
  //     );

  //     if (checkUserId) {
  //       this.logger.log(`user have in array workers`);
  //       return;
  //     }

  //     const updated = await this.model.findByIdAndUpdate(
  //       id,
  //       {
  //         workers: [...isExist.workers, userId],
  //       },
  //       { new: true },
  //     );

  //     // create assigntask
  //     if (isExist.tasks.length > 0) {
  //       const createAssignTask = isExist.tasks.map((item: string) =>
  //         this.assignTaskService.create({
  //           task: item,
  //           creator: updatePartDto.creator,
  //           worker: userId,
  //           workers: '',
  //           part: '',
  //         }),
  //       );

  //       await Promise.all(createAssignTask);
  //     }

  //     this.logger.log(`updated field part by id #${updated?._id}`);

  //     return updated;
  //   } catch (error) {
  //     this.logger.error(error?.message, error.stack);
  //     throw new BadRequestException(error?.message);
  //   }
  // }

  // async updateFiledTask(id: string, task: string) {
  //   try {
  //     const isExits = await this.isModelExit(id);

  //     const updated = await this.model.findByIdAndUpdate(
  //       id,
  //       {
  //         tasks: [...isExits.tasks, task],
  //       },
  //       { new: true },
  //     );

  //     this.logger.log(`updated a part by id#${updated?._id}`);

  //     return updated;
  //   } catch (error) {
  //     this.logger.error(error?.message, error.stack);
  //     throw new BadRequestException(error?.message);
  //   }
  // }

  // async removeUserInPart(partId: string, userId: string) {
  //   try {
  //     const part = await this.isModelExit(partId);

  //     const removeAssign = this.assignTaskService.removeByIdUserAndTask(
  //       part?.tasks,
  //       userId,
  //     );

  //     const removedUser = this.model.findByIdAndUpdate(
  //       partId,
  //       {
  //         workers: part.workers.filter(
  //           (item) => item.toString() !== userId.toString(),
  //         ),
  //       },
  //       {
  //         new: true,
  //       },
  //     );

  //     const exec = await Promise.all([removedUser, removeAssign]);

  //     this.logger.log(`removed a user in part by id#${exec[0]?._id}`);

  //     return exec[0];
  //   } catch (error) {
  //     this.logger.error(error?.message, error.stack);
  //     throw new BadRequestException(error?.message);
  //   }
  // }

  async isModelExit(id, isOptional = false, msg = '') {
    if (isOptional && !id) return;
    const message = msg || `id ${Part.name} not found`;
    const isExit = await this.findOne(id);
    if (!isExit) throw new Error(message);
    return isExit;
  }
}
