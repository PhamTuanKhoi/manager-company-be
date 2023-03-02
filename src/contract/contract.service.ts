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
import { SalaryService } from 'src/salary/salary.service';
import { UserService } from 'src/user/user.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { Contract, ContractDocument } from './schema/contract.schema';

@Injectable()
export class ContractService {
  private readonly logger = new Logger(ContractService.name);

  constructor(
    @InjectModel(Contract.name) private readonly model: Model<ContractDocument>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => SalaryService))
    private readonly salaryService: SalaryService,
    @Inject(forwardRef(() => ProjectService))
    private readonly projectService: ProjectService,
  ) {}

  async createOrUpdate(updateContractDto: UpdateContractDto) {
    try {
      const { user, salary, creator, project } = updateContractDto;

      // check data input
      await Promise.all([
        this.userService.isModelExist(user),
        this.userService.isModelExist(creator),
        this.salaryService.isModelExists(salary),
        this.projectService.isModelExist(project),
      ]);

      const isExist = await this.findByIdUserAndSalary(user, project);

      if (isExist) {
        return this.update(isExist?._id?.toString(), updateContractDto, false);
      }

      return this.create({ user, salary, creator, project }, false);
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async create(createContractDto: CreateContractDto, check = true) {
    // check data input
    if (check)
      await Promise.all([
        this.userService.isModelExist(createContractDto.user),
        this.userService.isModelExist(createContractDto.creator),
        this.salaryService.isModelExists(createContractDto.salary),
      ]);

    const created = await this.model.create(createContractDto);

    this.logger.log(`created a new contract by id#${created?._id}`);

    return created;
  }

  async update(id: string, updateContractDto: UpdateContractDto, check = true) {
    // check data input
    if (check)
      await Promise.all([
        this.userService.isModelExist(updateContractDto.user),
        this.userService.isModelExist(updateContractDto.creator),
        this.salaryService.isModelExists(updateContractDto.salary),
      ]);

    const updated = await this.model.findByIdAndUpdate(id, updateContractDto, {
      new: true,
    });

    this.logger.log(`updated a contract by id#${updated?._id}`);

    return updated;
  }

  findOne(id: string) {
    return this.model.findById(id).lean();
  }

  async findByIdUserAndSalary(user: string, project: string) {
    return await this.model.findOne({ user, project });
  }

  async isModelExists(id, isOption = false, msg = '') {
    if (!id && isOption) return;
    const message = msg || 'contract not found';
    const isExist = await this.findOne(id);
    if (!isExist) throw new Error(message);
    return isExist;
  }
}
