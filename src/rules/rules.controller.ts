import { Controller, Post, Body, Patch, Get, Param, Req } from '@nestjs/common';
import { RulesService } from './rules.service';
import { CreateRuleDto } from './dto/create-rule.dto';
import { UpdateRuleDto } from './dto/update-rule.dto';
import { Request } from 'express';

@Controller('rules')
export class RulesController {
  constructor(private readonly rulesService: RulesService) {}

  @Get(':id/project')
  findOneRefProject(@Param('id') id: string) {
    return this.rulesService.findOneRefProject(id);
  }

  @Post()
  create(@Body() createRuleDto: CreateRuleDto, @Req() req: Request) {
    return this.rulesService.create(createRuleDto, req);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRuleDto: UpdateRuleDto) {
    return this.rulesService.update(id, updateRuleDto);
  }
}
