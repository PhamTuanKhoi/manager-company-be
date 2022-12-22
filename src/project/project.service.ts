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
import { PayslipService } from 'src/payslip/payslip.service';
import { UserService } from 'src/user/user.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project, ProjectDocument } from './schema/project.schema';

@Injectable()
export class ProjectService {
  private readonly logger = new Logger(ProjectService.name);

  constructor(
    @InjectModel(Project.name) private model: Model<ProjectDocument>,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    @Inject(forwardRef(() => PayslipService))
    private payslipService: PayslipService,
  ) {}

  findAll() {
    return this.model.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'team',
          foreignField: '_id',
          as: 'team',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'creator',
          foreignField: '_id',
          as: 'creator',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'leader',
          foreignField: '_id',
          as: 'leader',
        },
      },
    ]);
  }

  findByIdUser(id: string) {
    return `This action returns a #${id} project`;
  }

  async create(createProjectDto: CreateProjectDto) {
    try {
      let clientApi = createProjectDto.client.map((i) => {
        return this.userService.findOne(i);
      });

      let teamApi = createProjectDto.team.map((i) => {
        return this.userService.findOne(i);
      });
      //find client
      const client = await Promise.all(clientApi);
      //find team
      const team = await Promise.all(teamApi);

      await this.userService.isModelExist(createProjectDto.creator);

      if (createProjectDto.client.length !== client.length) {
        throw new HttpException(`client not found`, HttpStatus.BAD_REQUEST);
      }

      if (createProjectDto.team.length !== team.length) {
        throw new HttpException(`team not found`, HttpStatus.BAD_REQUEST);
      }

      const creator = await this.model.create(createProjectDto);

      this.logger.log(`create a new project by id #${creator?._id}`);

      return creator;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    try {
      // exit model payslip
      if (updateProjectDto.payslip) {
        await this.payslipService.isModelExist(updateProjectDto.payslip);
      }

      const updatedPayslip = await this.model.findByIdAndUpdate(
        id,
        updateProjectDto,
        { new: true },
      );

      this.logger.log(`updated a payslip by id #${updatedPayslip?._id}`);

      return updatedPayslip;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} project`;
  }
}
