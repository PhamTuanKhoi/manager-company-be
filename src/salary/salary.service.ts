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

  list() {
    return this.model.find();
  }

  findOne(id: string) {
    return this.model.findById(id).lean();
  }

  async create(createSalaryDto: CreateSalaryDto) {
    try {
      // check data input
      await this.userService.isModelExist(createSalaryDto.creator);
      await this.projectService.isModelExist(createSalaryDto.project);

      const created = await this.model.create(createSalaryDto);

      this.logger.log(`created a salary by id #${created?._id}`);

      return created;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  update(id: string, updateSalaryDto: UpdateSalaryDto) {
    return `This action updates a #${id} salary`;
  }

  async isModelExists(id, isOptional = false, msg: '') {
    if (!id && isOptional) return;
    const message = msg || 'Salary not found';
    const isExist = await this.findOne(id);
    if (!isExist) throw new Error(message);
    return isExist;
  }
}
