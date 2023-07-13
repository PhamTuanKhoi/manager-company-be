import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ContractCategoryService } from './contract-category.service';
import { CreateContractCategoryDto } from './dto/create-contract-category.dto';
import { UpdateContractCategoryDto } from './dto/update-contract-category.dto';

@Controller('contract-category')
export class ContractCategoryController {
  constructor(
    private readonly contractCategoryService: ContractCategoryService,
  ) {}

  @Post()
  create(@Body() createContractCategoryDto: CreateContractCategoryDto) {
    return this.contractCategoryService.create(createContractCategoryDto);
  }

  @Get()
  findAll() {
    return this.contractCategoryService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.contractCategoryService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateContractCategoryDto: UpdateContractCategoryDto,
  ) {
    return this.contractCategoryService.update(id, updateContractCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contractCategoryService.remove(id);
  }
}
