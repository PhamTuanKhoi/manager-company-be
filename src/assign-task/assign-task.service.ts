import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TaskService } from 'src/task/task.service';
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

  async create(createAssignTaskDto: CreateAssignTaskDto) {
    try {
      //check user
      await this.userService.isModelExist(createAssignTaskDto.worker);
      // check task
      await this.taskService.isExitModel(createAssignTaskDto.task);

      console.log(createAssignTaskDto);

      return true;
    } catch (error) {}
  }

  remove(id: number) {
    return `This action removes a #${id} assignTask`;
  }
}
