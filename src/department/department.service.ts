import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { Department } from './schema/department.schema';

@Injectable()
export class DepartmentService {
  private readonly logger = new Logger(DepartmentService.name);

  constructor(@InjectModel(Department.name) private model: Model<Department>) {}

  async create(createDepartmentDto: CreateDepartmentDto) {
    try {
      const created = await this.model.create(createDepartmentDto);

      this.logger.log(`created a new department by id#${created?._id}`);

      return created;
    } catch (error) {
      this.logger.error(error?.message, error?.stack);
      throw new BadRequestException(error?.message);
    }
  }

  findAll() {
    return this.model.find();
  }

  findById(id: string) {
    return this.model.findById(id).lean();
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto) {
    try {
      await this.isModelExists(id);

      const updated = await this.model.findByIdAndUpdate(
        id,
        updateDepartmentDto,
        { new: true },
      );

      this.logger.log(`updated a department by id#${updated?._id}`);

      return updated;
    } catch (error) {
      this.logger.error(error?.message, error?.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async remove(id: string) {
    try {
      await this.isModelExists(id);

      const deleted = await this.model.findByIdAndDelete(id);

      this.logger.log(`deleted a department by id#${deleted?._id}`);

      return deleted;
    } catch (error) {
      this.logger.error(error?.message, error?.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async isModelExists(id: string, opition = false, mess = '') {
    if (!id && opition) return;

    const message = mess || 'id  -> department not found';

    const isExists = await this.findById(id);

    if (!isExists) throw new HttpException(message, HttpStatus.BAD_GATEWAY);

    return isExists;
  }
}
