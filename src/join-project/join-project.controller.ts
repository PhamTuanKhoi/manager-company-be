import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { JoinProjectService } from './join-project.service';
import { CreateJoinProjectDto } from './dto/create-join-project.dto';
import { UpdateJoinProjectDto } from './dto/update-join-project.dto';

@Controller('join-project')
export class JoinProjectController {
  constructor(private readonly joinProjectService: JoinProjectService) {}

  @Post()
  create(@Body() createJoinProjectDto: CreateJoinProjectDto) {
    return this.joinProjectService.create(createJoinProjectDto);
  }

  @Patch('premiums-insurance/:id')
  premiumsInsurance(
    @Param('id') id: string,
    @Body() payload: { premiums: string },
  ) {
    return this.joinProjectService.premiumsInsurance(id, payload);
  }
}
