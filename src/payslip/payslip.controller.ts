import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PayslipService } from './payslip.service';
import { CreatePayslipDto } from './dto/create-payslip.dto';
import { UpdatePayslipDto } from './dto/update-payslip.dto';

@Controller('payslip')
export class PayslipController {
  constructor(private readonly payslipService: PayslipService) {}

  @Post()
  create(@Body() createPayslipDto: CreatePayslipDto) {
    return this.payslipService.create(createPayslipDto);
  }

  @Get('employees/:id')
  findByEmployees(@Param('id') id: string) {
    return this.payslipService.findByEmployees(id);
  }

  @Get('project/:id')
  findByProject(@Param('id') id: string) {
    return this.payslipService.findByProject(id);
  }

  @Get('user/:id')
  findByIdUser(@Param('id') id: string) {
    return this.payslipService.findByIdUser(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePayslipDto: UpdatePayslipDto) {
    return this.payslipService.update(+id, updatePayslipDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.payslipService.remove(+id);
  }
}
