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
import { MessageApiService } from './message-api.service';
import { CreateMessageApiDto } from './dto/create-message-api.dto';
import { UpdateMessageApiDto } from './dto/update-message-api.dto';
import { QueryMessageApiDto } from './dto/query-message-api.dto';

@Controller('message-api')
export class MessageApiController {
  constructor(private readonly messageApiService: MessageApiService) {}

  @Post()
  create(@Body() createMessageApiDto: CreateMessageApiDto) {
    return this.messageApiService.create(createMessageApiDto);
  }

  @Get()
  findAll(@Query() queryMessageApiDto: QueryMessageApiDto) {
    return this.messageApiService.findAll(queryMessageApiDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.messageApiService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMessageApiDto: UpdateMessageApiDto,
  ) {
    return this.messageApiService.update(+id, updateMessageApiDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.messageApiService.remove(+id);
  }
}
