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
import { CreateSalaryDto } from './dto/create-salary.dto';
import { QuerySalaryDto } from './dto/query-salary.dto';
import { UpdateSalaryDto } from './dto/update-salary.dto';
import { Salary, SalaryDocument } from './schema/salary.schema';

@Injectable()
export class SalaryService {
  private readonly logger = new Logger(SalaryService.name);

  constructor(
    @InjectModel(Salary.name) private model: Model<SalaryDocument>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => ProjectService))
    private readonly projectService: ProjectService,
  ) {}

  async list(querySalaryDto: QuerySalaryDto) {
    let query: any = [
      {
        $lookup: {
          from: 'projects',
          localField: 'project',
          foreignField: '_id',
          pipeline: [
            {
              $project: {
                name: '$name',
              },
            },
          ],
          as: 'projectEX',
        },
      },
      {
        $unwind: '$projectEX',
      },
    ];

    if (querySalaryDto.name) {
      query = [
        ...query,
        {
          $match: {
            beneficiary: {
              $regex: '.*' + querySalaryDto.name + '.*',
              $options: 'i',
            },
          },
        },
      ];
    }

    return this.model.aggregate(query);
  }

  findOne(id: string) {
    return this.model.findById(id).lean();
  }

  async create(createSalaryDto: CreateSalaryDto) {
    try {
      // check data input
      await Promise.all([
        this.userService.isModelExist(createSalaryDto.creator),
        this.projectService.isModelExist(createSalaryDto.project),
      ]);

      const created = await this.model.create(createSalaryDto);

      this.logger.log(`created a salary by id #${created?._id}`);

      return created;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async update(id: string, updateSalaryDto: UpdateSalaryDto) {
    try {
      // check input data
      await this.userService.isModelExist(updateSalaryDto.creator);
      await this.projectService.isModelExist(updateSalaryDto.project);

      const updated = await this.model.findByIdAndUpdate(id, updateSalaryDto, {
        new: true,
      });

      this.logger.log(`updated a salary by id#${updated?._id}`);

      return updated;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async delete(id: string) {
    try {
      await this.isModelExists(id);

      const removed = await this.model.findByIdAndRemove(id);

      this.logger.log(`Remove a salary by id#${removed?._id}`);

      return removed;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async isModelExists(id, isOptional = false, msg = '') {
    if (!id && isOptional) return;
    const message = msg || 'Salary not found';
    const isExist = await this.findOne(id);
    if (!isExist) throw new Error(message);
    return isExist;
  }
}
