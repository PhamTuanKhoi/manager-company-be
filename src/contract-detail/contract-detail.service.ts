import { InjectQueue } from '@nestjs/bull';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Queue } from 'bull';
import { Model } from 'mongoose';
import { BULLL_NAME_CONTRACT_DETAIL } from 'src/attendance/contants/bull.name';
import { UserService } from 'src/user/user.service';
import { CreateContractDetailDto } from './dto/create-contract-detail.dto';
import { UpdateContractDetailDto } from './dto/update-contract-detail.dto';
import { ContractDetail } from './schema/contract-detail.schema';

@Injectable()
export class ContractDetailService {
  private readonly logger = new Logger(ContractDetailService.name);
  constructor(
    @InjectModel(ContractDetail.name)
    private readonly model: Model<ContractDetail>,
    private readonly userService: UserService,
    @InjectQueue(BULLL_NAME_CONTRACT_DETAIL) private contractDetailQueue: Queue,
  ) {}

  async findAll() {
    return this.model.find();
  }

  async create(createContractDetailDto: CreateContractDetailDto) {
    const { client, worker } = createContractDetailDto;
    try {
      // validation
      await this.userService.isModelExist(client?._id);
      await this.userService.isModelExist(worker?._id);

      // queue
      await this.contractDetailQueue.add('update-client', client);
      await this.contractDetailQueue.add('update-worker', worker);

      // save contract detail
      return this.handleCreate(createContractDetailDto);
    } catch (error) {
      this.logger.error(error?.message, error?.stack);
      throw new BadRequestException(error);
    }
  }

  async handleCreate(createContractDetailDto: CreateContractDetailDto) {
    const { client, worker } = createContractDetailDto;
    try {
      let code = 1;
      const ctDs = (await this.findAll()).sort((a, b) => a.code - b.code);

      if (ctDs.length > 0) code = ctDs[ctDs.length - 1]?.code + 1;

      const saved = await this.model.create({
        ...createContractDetailDto,
        client: client?._id,
        worker: worker?._id,
        code,
      });
      this.logger.log(`created a new contract-detail by id#${saved?._id}`);
      return saved;
    } catch (error) {
      this.logger.error(error?.message, error?.stack);
      throw new BadRequestException(error);
    }
  }
}
