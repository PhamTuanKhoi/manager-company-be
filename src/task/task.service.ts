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
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskDocument } from './schema/task.schema';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);
  constructor(
    @InjectModel(Task.name) private model: Model<TaskDocument>,
    @Inject(forwardRef(() => ProjectService))
    private readonly projectService: ProjectService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  async create(createTaskDto: CreateTaskDto) {
    try {
      await this.projectService.isModelExist(createTaskDto.project);

      const createdTask = await this.model.create(createTaskDto);

      this.logger.log(`created a new task by id #${createdTask?._id}`);

      return createdTask;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  findByProject(id) {
    try {
      return this.model.aggregate([
        {
          $match: {
            $expr: {
              $eq: ['$project', { $toObjectId: id }],
            },
          },
        },
      ]);
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  update(id: number, updateTaskDto: UpdateTaskDto) {
    return `This action updates a #${id} task`;
  }

  remove(id: number) {
    return `This action removes a #${id} task`;
  }
}
