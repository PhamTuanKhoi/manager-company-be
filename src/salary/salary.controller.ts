import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SalaryService } from './salary.service';
import { CreateSalaryDto } from './dto/create-salary.dto';
import { UpdateSalaryDto } from './dto/update-salary.dto';

@Controller('salary')
export class SalaryController {
  constructor(private readonly salaryService: SalaryService) {}

  @Get()
  list() {
    return this.salaryService.list();
  }

  @Post()
  create(@Body() createSalaryDto: CreateSalaryDto) {
    return this.salaryService.create(createSalaryDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSalaryDto: UpdateSalaryDto) {
    return this.salaryService.update(id, updateSalaryDto);
  }
}
