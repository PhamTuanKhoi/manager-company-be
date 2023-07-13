import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
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

  @Get()
  findAll() {
    return this.contractDetailService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contractDetailService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateContractDetailDto: UpdateContractDetailDto) {
    return this.contractDetailService.update(+id, updateContractDetailDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contractDetailService.remove(+id);
  }
}
