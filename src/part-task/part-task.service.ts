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
import { TaskService } from 'src/task/task.service';
import { CreatePartTaskDto } from './dto/create-part-task.dto';
import { PartTask, PartTaskDocument } from './schema/part-task.schema';

@Injectable()
export class PartTaskService {
  private readonly logger = new Logger(PartTaskService.name);

  constructor(
    @InjectModel(PartTask.name) private model: Model<PartTaskDocument>,
    @Inject(forwardRef(() => PartService))
    private readonly partService: PartService,
    @Inject(forwardRef(() => TaskService))
    private readonly taskService: TaskService,
  ) {}

  async create(createPartTaskDto: CreatePartTaskDto) {
    try {
      // check input data
      await Promise.all([
        this.partService.isModelExit(createPartTaskDto.part),
        this.taskService.isExitModel(createPartTaskDto.task),
      ]);

      const created = await this.model.create(createPartTaskDto);

      this.logger.log(`created a new part-task by id#${created?._id}`);

      return created;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  findOne(id: string) {
    return this.model.findById(id).lean();
  }

  async isModelExists(id, opition = false, msg = '') {
    if (!id && opition) return;
    const message = msg || 'part-task not found';
    const isExists = await this.findOne(id);
    if (!isExists) throw new Error(message);
    return isExists;
  }
}
