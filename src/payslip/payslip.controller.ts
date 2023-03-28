import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { PayslipService } from './payslip.service';
import { CreatePayslipDto } from './dto/create-payslip.dto';
import { UpdatePayslipDto } from './dto/update-payslip.dto';
import { QueryPayslipDto } from './dto/query-payslip.dto';

@Controller('payslip')
export class PayslipController {
  constructor(private readonly payslipService: PayslipService) {}

  @Get()
  list() {
    return this.payslipService.list();
  }

  @Get('detail')
  detail(@Query() queryPayslipDto: QueryPayslipDto) {
    return this.payslipService.detail(queryPayslipDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.payslipService.findOne(id);
  }

  // @Get('employees/:id')
  // findByEmployees(@Param('id') id: string) {
  //   return this.payslipService.findByEmployees(id);
  // }

  @Get('by-user/:id')
  findByClient(@Param('id') id: string) {
    return this.payslipService.findByUserId(id);
  }

  // @Get('worker/:id')
  // findByWorker(@Param('id') id: string) {
  //   return this.payslipService.findByWorker(id);
  // }

  @Get('project/:id')
  findByProject(@Param('id') id: string) {
    return this.payslipService.findByProject(id);
  }

  @Get('user/:id')
  findByIdUser(@Param('id') id: string) {
    return this.payslipService.findByIdUser(id);
  }

  @Post()
  create(@Body() createPayslipDto: CreatePayslipDto) {
    return this.payslipService.create(createPayslipDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePayslipDto: UpdatePayslipDto) {
    return this.payslipService.update(id, updatePayslipDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.payslipService.remove(id);
  }
}
