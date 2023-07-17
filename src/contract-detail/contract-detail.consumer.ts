import { Processor, Process, OnGlobalQueueCompleted } from '@nestjs/bull';
import { BadRequestException, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { BULLL_NAME_CONTRACT_DETAIL } from 'src/attendance/contants/bull.name';
import { UpdateUserDetailDto } from 'src/user-detail/dto/update-user-detail.dto';
import { UserDetailService } from 'src/user-detail/user-detail.service';
import { UserService } from 'src/user/user.service';
import { CombinedClientAndUserDto } from './dto/combine-client-userdetail.dto';
import { CombinedWorkerAndUserDto } from './dto/combine-worker-userdetail.dto';

@Processor(BULLL_NAME_CONTRACT_DETAIL)
export class ContractDetailConsumer {
  private readonly logger = new Logger(ContractDetailConsumer.name);
  constructor(
    private readonly userService: UserService,
    private readonly userDetailService: UserDetailService,
  ) {}

  @Process('update-client')
  async updateClient(job: Job<CombinedClientAndUserDto>) {
    const client: CombinedClientAndUserDto = { ...job?.data };

    try {
      await this.userService.updateClient(client?._id, client);
    } catch (error) {
      this.logger.log(error?.message, error?.stack);
      throw new BadRequestException(error);
    }

    const updateUserDetailDto = new UpdateUserDetailDto();
    updateUserDetailDto.nationality = job?.data?.nationality;
    updateUserDetailDto.user = job?.data?._id;
    return updateUserDetailDto;
  }

  @Process('update-worker')
  async updateWorker(job: Job<CombinedWorkerAndUserDto>) {
    const worker: Omit<
      CombinedWorkerAndUserDto,
      'password' | 'confrimpasword'
    > = { ...job?.data };

    try {
      await this.userService.updateWorker(worker?._id, worker);
    } catch (error) {
      this.logger.log(error?.message, error?.stack);
      throw new BadRequestException(error);
    }

    const updateUserDetailDto = new UpdateUserDetailDto();
    updateUserDetailDto.bornAt = job?.data?.bornAt;
    updateUserDetailDto.cccdAt = job?.data?.cccdAt;
    updateUserDetailDto.dateCccd = job?.data?.dateCccd;
    updateUserDetailDto.nationality = job?.data?.nationality;
    updateUserDetailDto.resident = job?.data?.resident;
    updateUserDetailDto.user = job?.data?._id;

    return updateUserDetailDto;
  }

  @OnGlobalQueueCompleted({ name: 'update-client' })
  async createOrUpdateClientDetail(job: Job, result: any) {
    const updateUserDetailDto: UpdateUserDetailDto = JSON.parse(
      result.toString(),
    );

    return this.userDetailService.createOrUpdate(updateUserDetailDto);
  }

  @OnGlobalQueueCompleted({ name: 'update-worker' })
  async createOrUpdateWorkerDetail(job: Job, result: any) {
    const updateUserDetailDto: UpdateUserDetailDto = JSON.parse(
      result.toString(),
    );

    return this.userDetailService.createOrUpdate(updateUserDetailDto);
  }
}
