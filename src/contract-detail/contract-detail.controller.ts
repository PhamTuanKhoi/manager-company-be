import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ContractDetailService } from './contract-detail.service';
import { CreateContractDetailDto } from './dto/create-contract-detail.dto';
import { UpdateContractDetailDto } from './dto/update-contract-detail.dto';

@Controller('contract-detail')
export class ContractDetailController {
  constructor(private readonly contractDetailService: ContractDetailService) {}

  @Post()
  create(@Body() createContractDetailDto: CreateContractDetailDto) {
    return this.contractDetailService.create(createContractDetailDto);
  }
}
