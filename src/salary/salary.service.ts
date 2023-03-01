import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateSalaryDto } from './dto/create-salary.dto';
import { UpdateSalaryDto } from './dto/update-salary.dto';
import { Salary, SalaryDocument } from './schema/salary.schema';

@Injectable()
export class SalaryService {
  private readonly logger = new Logger(SalaryService.name);

  constructor(@InjectModel(Salary.name) private model: Model<SalaryDocument>) {}

  findOne(id: string) {
    return this.model.findById(id).lean();
  }

  create(createSalaryDto: CreateSalaryDto) {
    try {
      return 'This action adds a new salary';
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
