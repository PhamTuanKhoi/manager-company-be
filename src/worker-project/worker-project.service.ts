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
import { UpdateWorkerProjectDto } from './dto/update-worker-project.dto';
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

  findAll() {
    return `This action returns all workerProject`;
  }

  findOne(id: string) {
    return this.model.findById(id);
  }

  async findByProject(id: string) {
    const data = await this.model.find({ project: id });
    return data;
  }

  update(id: number, updateWorkerProjectDto: UpdateWorkerProjectDto) {
    return `This action updates a #${id} workerProject`;
  }

  remove(id: number) {
    return `This action removes a #${id} workerProject`;
  }
}
