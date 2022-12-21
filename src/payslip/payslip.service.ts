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

  findAll() {
    return `This action returns all payslip`;
  }

  findOne(id: number) {
    return `This action returns a #${id} payslip`;
  }

  update(id: number, updatePayslipDto: UpdatePayslipDto) {
    return `This action updates a #${id} payslip`;
  }

  remove(id: number) {
    return `This action removes a #${id} payslip`;
  }
}
