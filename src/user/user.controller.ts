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

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post('employees')
  newEmplyees(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.userService.newEmployees(createEmployeeDto);
  }

  @Get('employees')
  findAllEloyees() {
    return this.userService.findAllEloyees();
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.userService.findOne(+id);
  // }

  @Patch('employees/:id')
  updateEmployees(
    @Param('id') id: string,
    @Body() updateEmployeesDto: UpdateEmployeesDto,
  ) {
    return this.userService.updateEmployees(id, updateEmployeesDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
