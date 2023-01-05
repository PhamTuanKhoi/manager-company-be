import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-dto/create-user.dto';
import { UpdateUserDto } from './dto/update-dto/update-user.dto';
import { CreateEmployeeDto } from './dto/create-dto/create-employee.dto';
import { UpdateEmployeesDto } from './dto/update-dto/update-employees.dto';
import { CreateClientDto } from './dto/create-dto/create-client.dto';
import { UpdateClientDto } from './dto/update-dto/update-client.dto';
import { CreateWorkerDto } from './dto/create-dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-dto/update-worker.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('employees')
  findAllEloyees() {
    return this.userService.findAllEloyees();
  }

  @Get('client')
  findAllClient() {
    return this.userService.findAllClient();
  }

  @Get('worker')
  findAllWorker() {
    return this.userService.findAllWorker();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post('employees')
  newEmplyees(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.userService.newEmployees(createEmployeeDto);
  }

  @Post('client')
  newClient(@Body() createClientDto: CreateClientDto) {
    return this.userService.newClient(createClientDto);
  }

  @Post('worker')
  newWorker(@Body() createWorkerDto: CreateWorkerDto) {
    return this.userService.newWorker(createWorkerDto);
  }

  @Patch('employees/:id')
  updateEmployees(
    @Param('id') id: string,
    @Body() updateEmployeesDto: UpdateEmployeesDto,
  ) {
    return this.userService.updateEmployees(id, updateEmployeesDto);
  }

  @Patch('client/:id')
  updateClient(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
  ) {
    return this.userService.updateClient(id, updateClientDto);
  }

  @Patch('worker/:id')
  updateWorker(@Param('id') id: string, @Body() updateWorker: UpdateWorkerDto) {
    return this.userService.updateWorker(id, updateWorker);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
