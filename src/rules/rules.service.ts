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
import * as WiFiControl from 'wifi-control';

@Injectable()
export class RulesService {
  private readonly logger = new Logger(RulesService.name);

  constructor(
    @InjectModel(Rule.name) private model: Model<RuleDocument>,
    @Inject(forwardRef(() => ProjectService))
    private readonly projectService: ProjectService,
  ) {}

  async create(createRuleDto: CreateRuleDto) {
    try {
      await this.projectService.isModelExist(createRuleDto.project);
      var _ap = {
        ssid: createRuleDto.wiffi,
        password: createRuleDto.password,
      };

      WiFiControl.init({
        debug: true,
      });
      // get login wifi
      let res: boolean = false;

      WiFiControl.connectToAP(_ap, function (err, response) {
        if (err) console.log(err);
        // assign value res
        res = response.success;

        if (!response.success)
          throw new Error('Tên wiffi hoặc mật khẩu không chính xác!');
      });

      if (res) {
        const created = await this.model.create(createRuleDto);

        this.logger.log(`created a new rules by id#${created?._id}`);

        return created;
      }
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
