import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  SetMetadata,
  Res,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-dto/create-user.dto';
import { CreateEmployeeDto } from './dto/create-dto/create-employee.dto';
import { UpdateEmployeesDto } from './dto/update-dto/update-employees.dto';
import { CreateClientDto } from './dto/create-dto/create-client.dto';
import { UpdateClientDto } from './dto/update-dto/update-client.dto';
import { CreateWorkerDto } from './dto/create-dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-dto/update-worker.dto';
import { QueryWorkerProject } from './interfaces/worker-assign-query';
import { QueryNotificationMessage } from './interfaces/notification-message-query copy';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { UserRoleEnum } from './interfaces/role-user.enum';
import { Response } from 'express';

export const ROLES_KEY = 'role';
export const Roles = (...roles: UserRoleEnum[]) =>
  SetMetadata(ROLES_KEY, roles);

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('notification-message')
  notificationMessage(
    @Query() queryNotificationMessage: QueryNotificationMessage,
  ) {
    return this.userService.notificationMessage(queryNotificationMessage);
  }

  @Get('employees')
  findAllEloyees() {
    return this.userService.findAllEloyees();
  }

  @Get('worker/excellent')
  findAllWorkerExcellent() {
    return this.userService.findAllWorkerExcellent();
  }

  @Get('not-assign-part/:id')
  notAssignPart(@Param('id') id: string) {
    return this.userService.notAssignPart(id);
  }

  @Get('employees-role-client/:id')
  findAllEloyeesByClient(@Param('id') id: string) {
    return this.userService.findAllEloyeesByClient(id);
  }

  @Get('employees-role-worker/:id')
  findAllEloyeesByWorker(@Param('id') id: string) {
    return this.userService.findAllEloyeesByWorker(id);
  }

  @Get('client-role-employees/:id')
  findAllClientByEmployees(@Param('id') id: string) {
    return this.userService.findAllClientByEmployees(id);
  }

  @Get('client')
  findAllClient() {
    return this.userService.findAllClient();
  }

  @UseGuards(JwtAuthGuard)
  @Get('worker')
  // @Roles(UserRoleEnum.WORKER)
  findAllWorker() {
    return this.userService.findAllWorker();
  }

  @Get('worker-no-assign')
  workerNoAssign() {
    return this.userService.workerNoAssign();
  }

  @Get('worker-project-by-client')
  workerProjectByClient(@Query() QueryWorkerProject: QueryWorkerProject) {
    return this.userService.workerProjectByClient(QueryWorkerProject);
  }

  // @Get('worker-project-by-employees')
  // workerProjectByEmployees(@Query() QueryWorkerProject: QueryWorkerProject) {
  //   return this.userService.workerProjectByEmployees(QueryWorkerProject);
  // }

  @Get('worker-role-client/:id')
  findAllWorkerByClient(@Param('id') id: string) {
    return this.userService.findAllWorkerByClient(id);
  }

  @Get('worker-role-employees/:id')
  findAllWorkerByEmployees(@Param('id') id: string) {
    return this.userService.findAllWorkerByEmployees(id);
  }

  @Get('attendance')
  userAttendance(@Query() query: { project: string; date: string }) {
    return this.userService.userAttendance(query);
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
