import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PartTaskService } from './part-task.service';
import { CreatePartTaskDto } from './dto/create-part-task.dto';
import { UpdatePartTaskDto } from './dto/update-part-task.dto';

@Controller('part-task')
export class PartTaskController {
  constructor(private readonly partTaskService: PartTaskService) {}

  @Post()
  create(@Body() createPartTaskDto: CreatePartTaskDto) {
    return this.partTaskService.create(createPartTaskDto);
  }
}
