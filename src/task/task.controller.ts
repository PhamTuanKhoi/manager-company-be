import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
var WiFiControl = require('wifi-control');

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  async check(@Res() res) {
    //  Initialize wifi-control package with verbose output
    WiFiControl.init({
      debug: true,
    });

    //  Try scanning for access points:

    WiFiControl.scanForWiFi(function (err, response) {
      if (err) console.log(err);
      if (response.networks) res.status(200).json(response.networks);
    });

    // setTimeout(() => {
    //   console.log(networks);
    //   return networks;
    // }, 5000);

    // var _ap = {
    //   ssid: 'FCE Solutions',
    //   password: '55558888',
    // };

    // // get login wifi
    // let res: boolean = false;
    // WiFiControl.connectToAP(_ap, function (err, response) {
    //   if (err) console.log(err);
    //   res = response.success;
    // });

    // console.log(res);
  }

  @Get('project/:id')
  findByProject(@Param('id') id: string) {
    return this.taskService.findByProject(id);
  }

  @Post()
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.taskService.create(createTaskDto);
  }

  @Patch('assign/:id')
  updateFieldUser(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.taskService.updateFieldUser(id, updateTaskDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.taskService.remove(+id);
  }
}
