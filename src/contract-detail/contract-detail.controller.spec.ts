import { Test, TestingModule } from '@nestjs/testing';
import { ContractDetailController } from './contract-detail.controller';
import { ContractDetailService } from './contract-detail.service';

describe('ContractDetailController', () => {
  let controller: ContractDetailController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContractDetailController],
      providers: [ContractDetailService],
    }).compile();

    controller = module.get<ContractDetailController>(ContractDetailController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
