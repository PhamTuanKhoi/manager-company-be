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
import { QueryContractDetailDto } from './dto/QueryContractDetailDto';
import { UpdateContractDetailDto } from './dto/update-contract-detail.dto';

@Controller('contract-detail')
export class ContractDetailController {
  constructor(private readonly contractDetailService: ContractDetailService) {}

  @Get()
  findAll() {
    return this.contractDetailService.findAll();
  }

  @Get('query')
  async findAllQuery(queryContractDetailDto: QueryContractDetailDto) {
    return this.contractDetailService.findAllQuery(queryContractDetailDto);
  }

  @Get('/:id')
  findById(@Param('id') id: string) {
    return this.contractDetailService.findById(id);
  }

  @Post()
  create(@Body() createContractDetailDto: CreateContractDetailDto) {
    return this.contractDetailService.create(createContractDetailDto);
  }

  @Patch('/:id')
  update(
    @Param('id') id: string,
    @Body() updateContractDetailDto: UpdateContractDetailDto,
  ) {
    return this.contractDetailService.update(id, updateContractDetailDto);
  }

  @Delete('/:id')
  delete(@Param('id') id: string) {
    return this.contractDetailService.delete(id);
  }
}
