import { Test, TestingModule } from '@nestjs/testing';
import { ContractDetailService } from './contract-detail.service';

describe('ContractDetailService', () => {
  let service: ContractDetailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContractDetailService],
    }).compile();

    service = module.get<ContractDetailService>(ContractDetailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
