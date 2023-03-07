import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateOvertimeDto } from './dto/create-overtime.dto';
import { UpdateOvertimeDto } from './dto/update-overtime.dto';
import { Overtime, OvertimeDocument } from './schema/overtime.schema';

@Injectable()
export class OvertimeService {
  private readonly logger = new Logger(OvertimeService.name);

  constructor(
    @InjectModel(Overtime.name) private model: Model<OvertimeDocument>,
  ) {}
  create(createOvertimeDto: CreateOvertimeDto) {
    return 'This action adds a new overtime';
  }

  findAll() {
    return `This action returns all overtime`;
  }

  update(id: number, updateOvertimeDto: UpdateOvertimeDto) {
    return `This action updates a #${id} overtime`;
  }

  async findOne(id: string) {
    return this.model.findById(id).lean();
  }

  async isModelExists(id, isOpition = false, mes = '') {
    if (!id && isOpition) return;
    const message = mes || 'overtime not found';
    const isExist = await this.findOne(id);
    if (!isExist) throw new Error(message);
  }
}
