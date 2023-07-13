import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProjectService } from 'src/project/project.service';
import { CreateContractCategoryDto } from './dto/create-contract-category.dto';
import { UpdateContractCategoryDto } from './dto/update-contract-category.dto';
import { ContractCategory } from './schema/contract-category.schema';

@Injectable()
export class ContractCategoryService {
  private readonly logger = new Logger(ContractCategoryService.name);
  constructor(
    @InjectModel(ContractCategory.name)
    private model: Model<ContractCategory>,
    private readonly projectService: ProjectService,
  ) {}

  async create(createContractCategoryDto: CreateContractCategoryDto) {
    try {
      await this.projectService.isModelExist(createContractCategoryDto.project);
      await this.validation(createContractCategoryDto);

      const created = await this.model.create(createContractCategoryDto);
      this.logger.log(`created a new contract-category by id#${created?._id}`);
      return created;
    } catch (error) {
      this.logger.error(error?.message, error?.stack);
      throw new BadRequestException(error);
    }
  }

  async validation(updateContractCategoryDto: UpdateContractCategoryDto) {
    const { startDate, endDate } = updateContractCategoryDto;

    if (startDate && endDate) {
      if (startDate > endDate)
        throw new HttpException(
          `The closing date must be greater than the signing date`,
          HttpStatus.BAD_REQUEST,
        );
    }

    Object.keys(updateContractCategoryDto).map(
      (key) =>
        !updateContractCategoryDto[key] &&
        delete updateContractCategoryDto[key],
    );
  }

  findAll() {
    return this.model.aggregate([
      {
        $lookup: {
          from: 'projects',
          localField: 'project',
          foreignField: '_id',
          as: 'project',
        },
      },
      {
        $unwind: {
          path: '$project',
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);
  }

  findById(id: string) {
    return this.model.findById(id).lean();
  }

  async update(
    id: string,
    updateContractCategoryDto: UpdateContractCategoryDto,
  ) {
    try {
      await this.isModelExist(id);
      await this.validation(updateContractCategoryDto);

      const updated = await this.model.findByIdAndUpdate(
        id,
        updateContractCategoryDto,
        { new: true },
      );
      this.logger.log(`updated a contract-category by id#${updated?._id}`);
      return updated;
    } catch (error) {
      this.logger.error(error?.message, error?.stack);
      throw new BadRequestException();
    }
  }

  async remove(id: string) {
    try {
      await this.isModelExist(id);

      const deleted = await this.model.findByIdAndDelete(id);
      this.logger.log(`deleted a contract-category by id#${deleted?._id}`);
      return deleted;
    } catch (error) {
      this.logger.error(error?.message, error?.stack);
      throw new BadRequestException();
    }
  }

  async isModelExist(id, isOptional = false, msg = '') {
    if (isOptional && !id) return;
    const errorMessage = msg || `id-> ${ContractCategory.name} not found`;
    const isExist = await this.findById(id);

    if (!isExist) throw new Error(errorMessage);
    return isExist;
  }
}
