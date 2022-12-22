import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserService } from 'src/user/user.service';
import { CreatePayslipDto } from './dto/create-payslip.dto';
import { UpdatePayslipDto } from './dto/update-payslip.dto';
import { Payslip, PayslipDocument } from './schema/payslip.schema';

@Injectable()
export class PayslipService {
  private readonly logger = new Logger(PayslipService.name);

  constructor(
    @InjectModel(Payslip.name) private model: Model<PayslipDocument>,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}

  async create(createPayslipDto: CreatePayslipDto) {
    try {
      await this.userService.isModelExist(createPayslipDto.creator);

      const created = await this.model.create(createPayslipDto);

      this.logger.log(`created new payslip by id #${created._id}`);

      return created;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async isModelExist(id, isOptional = false, msg = '') {
    if (isOptional && !id) return;
    const errorMessage = msg || `id-> ${PayslipService.name} not found`;
    const isExist = await this.findOne(id);
    if (!isExist) throw new Error(errorMessage);
  }

  findOne(id: string) {
    return this.model.findById(id);
  }

  findAll() {
    return this.model.find();
  }

  findByIdUser(id: string) {
    return this.model.find({ creator: id });
  }

  update(id: number, updatePayslipDto: UpdatePayslipDto) {
    return `This action updates a #${id} payslip`;
  }

  remove(id: number) {
    return `This action removes a #${id} payslip`;
  }
}
