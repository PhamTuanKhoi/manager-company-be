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
import { ProjectService } from 'src/project/project.service';
import { UserService } from 'src/user/user.service';
import { CreateJoinProjectDto } from './dto/create-join-project.dto';
import { UpdateJoinProjectDto } from './dto/update-join-project.dto';
import { JoinProject, JoinProjectDocument } from './schema/join-project.schema';

@Injectable()
export class JoinProjectService {
  private readonly logger = new Logger(JoinProjectService.name);

  constructor(
    @InjectModel(JoinProject.name) private model: Model<JoinProjectDocument>,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    @Inject(forwardRef(() => ProjectService))
    private projectService: ProjectService,
  ) {}

  async create(createJoinProjectDto: CreateJoinProjectDto) {
    try {
      // check input data
      await Promise.all([
        this.userService.isModelExist(createJoinProjectDto.joinor),
        this.projectService.isModelExist(createJoinProjectDto.project),
      ]);

      const created = await this.model.create(createJoinProjectDto);

      this.logger.log(`created a new join-project by id#${created?._id}`);

      return created;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async premiumsInsurance(id, payload: { premiums: string }) {
    try {
      const join = await this.model.findById(id).lean();

      if (!join)
        throw new HttpException(
          `joinproject not found -> id`,
          HttpStatus.NOT_FOUND,
        );

      const updated = await this.model.findByIdAndUpdate(
        id,
        { premiumsInsurance: payload.premiums },
        { new: true },
      );

      this.logger.log(
        `updated a premiumsInsurance to ${updated?.premiumsInsurance} by id#${updated?._id}`,
      );

      return updated;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async deleteSubportUpdateProject(projectId: string, role: string) {
    try {
      const removed = await this.model.remove({ project: projectId, role });

      this.logger.log(`remove a join project success by id#`);

      return removed;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }
}
