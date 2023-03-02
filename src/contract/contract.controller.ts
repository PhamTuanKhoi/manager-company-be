import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ContractService } from './contract.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';

@Controller('contract')
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  @Post('create-or-update')
  createOrUpdate(@Body() updateContractDto: UpdateContractDto) {
    return this.contractService.createOrUpdate(updateContractDto);
  }

  @Post()
  create(@Body() createContractDto: CreateContractDto) {
    return this.contractService.create(createContractDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateContractDto: UpdateContractDto,
  ) {
    return this.contractService.update(id, updateContractDto);
  }
}
