import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProjectService } from 'src/project/project.service';
import { CreateRuleDto } from './dto/create-rule.dto';
import { UpdateRuleDto } from './dto/update-rule.dto';
import { Rule, RuleDocument } from './schema/rule.schema';

@Injectable()
export class RulesService {
  private readonly logger = new Logger(RulesService.name);

  constructor(
    @InjectModel(Rule.name) private model: Model<RuleDocument>,
    @Inject(forwardRef(() => ProjectService))
    private readonly projectService: ProjectService,
  ) {}

  create(createRuleDto: CreateRuleDto) {
    try {
      return 'This action adds a new rule';
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  findOne(id: string) {
    return this.model.findById(id).lean();
  }

  async isModelExists(id, isOption = false, msg = '') {
    if (!id && isOption) return;
    const message = msg || 'Rule not found';
    const isExists = this.findOne(id);
    if (!isExists) throw new Error(message);
    return isExists;
  }
}
