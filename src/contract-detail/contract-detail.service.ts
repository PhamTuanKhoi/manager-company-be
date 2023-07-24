import { InjectQueue } from '@nestjs/bull';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Queue } from 'bull';
import { Model, PipelineStage } from 'mongoose';
import { BULLL_NAME_CONTRACT_DETAIL } from 'src/attendance/contants/bull.name';
import { UserService } from 'src/user/user.service';
import { CombinedClientAndUserDto } from './dto/combine-client-userdetail.dto';
import { CombinedWorkerAndUserDto } from './dto/combine-worker-userdetail.dto';
import { CreateContractDetailDto } from './dto/create-contract-detail.dto';
import { QueryContractDetailDto } from './dto/QueryContractDetailDto';
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

  async findAllQuery(queryContractDetailDto: QueryContractDetailDto) {
    let query: PipelineStage[] = [
      {
        $lookup: {
          from: 'contractcategories',
          localField: 'contractCategory',
          foreignField: '_id',
          pipeline: [
            {
              $project: {
                name: '$name',
                project: '$project',
              },
            },
          ],
          as: 'contractCategory',
        },
      },
      {
        $unwind: {
          path: '$contractCategory',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'worker',
          foreignField: '_id',
          pipeline: [
            {
              $project: {
                code: '$code',
                name: '$name',
              },
            },
          ],
          as: 'worker',
        },
      },
      {
        $unwind: {
          path: '$worker',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'client',
          foreignField: '_id',
          pipeline: [
            {
              $project: {
                name: '$name',
              },
            },
          ],
          as: 'client',
        },
      },
      {
        $unwind: {
          path: '$client',
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    return this.model.aggregate(query);
  }

  async findById(id: string) {
    return this.model.findById(id).lean();
  }

  async create(createContractDetailDto: CreateContractDetailDto) {
    const { client, worker } = createContractDetailDto;
    try {
      // queue
      await this.handleCreateOrUpdateUserDetail(client, worker);

      // save contract detail
      return this.handleCreate(createContractDetailDto);
    } catch (error) {
      this.logger.error(error?.message, error?.stack);
      throw new BadRequestException(error);
    }
  }

  async handleCreateOrUpdateUserDetail(
    client: CombinedClientAndUserDto,
    worker: CombinedWorkerAndUserDto,
  ) {
    try {
      // validation
      await this.userService.isModelExist(client?._id);
      await this.userService.isModelExist(worker?._id);

      // queue
      await this.contractDetailQueue.add('update-client', client);
      await this.contractDetailQueue.add('update-worker', worker);
    } catch (error) {
      this.logger.error(error?.message, error?.stack);
      throw new BadRequestException(error);
    }
  }

  async handleCreate(createContractDetailDto: CreateContractDetailDto) {
    const { client, worker, contractCategoryId, projectId } =
      createContractDetailDto;
    try {
      let code = 1;
      const ctDs = (await this.findAll()).sort((a, b) => a.code - b.code);

      if (ctDs.length > 0) code = ctDs[ctDs.length - 1]?.code + 1;

      const saved = await this.model.create({
        ...createContractDetailDto,
        client: client?._id,
        worker: worker?._id,
        contractCategory: contractCategoryId,
        project: projectId,
        code,
      });
      this.logger.log(`created a new contract-detail by id#${saved?._id}`);
      return saved;
    } catch (error) {
      this.logger.error(error?.message, error?.stack);
      throw new BadRequestException(error);
    }
  }

  async update(id: string, updateContractDetailDto: UpdateContractDetailDto) {
    const { client, worker, contractCategoryId, projectId } =
      updateContractDetailDto;
    try {
      // queue
      await this.handleCreateOrUpdateUserDetail(client, worker);

      const updated = await this.model.findByIdAndUpdate(id, {
        ...updateContractDetailDto,
        client: client?._id,
        worker: worker?._id,
        contractCategory: contractCategoryId,
        project: projectId,
      });
      this.logger.log(`update a contract-detail by id#${updated?._id}`);
      return updated;
    } catch (error) {
      this.logger.error(error?.message, error?.stack);
      throw new BadRequestException(error);
    }
  }

  async delete(id: string) {
    try {
      await this.isModelExists(id);
      const deleted = await this.model.findByIdAndDelete(id);
      this.logger.log(`deleted a contract-detail by id#${deleted?._id}`);
      return deleted;
    } catch (error) {
      this.logger.error(error?.message, error?.stack);
      throw new BadRequestException(error);
    }
  }

  async isModelExists(id, isOption = false, msg = '') {
    if (!id && isOption) return;
    const message = msg || 'contract-detail not found';
    const isExist = await this.findById(id);
    if (!isExist) throw new Error(message);
    return isExist;
  }
}
