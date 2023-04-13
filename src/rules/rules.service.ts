import {
  BadRequestException,
  forwardRef,
  HttpException,
  HttpStatus,
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
import { Request } from 'express';
const os = require('os');
const network = require('network');
const dns = require('dns');
@Injectable()
export class RulesService {
  private readonly logger = new Logger(RulesService.name);

  constructor(
    @InjectModel(Rule.name) private model: Model<RuleDocument>,
    @Inject(forwardRef(() => ProjectService))
    private readonly projectService: ProjectService,
  ) {}

  findOneRefProject(id: string) {
    return this.model.findOne({ project: id }).lean();
  }

  async create(createRuleDto: CreateRuleDto, req: Request) {
    const { project, wiffi, password, timeIn, timeOut, lunchIn, lunchOut } =
      createRuleDto;
    try {
      // const ipAddress = req.connection.remoteAddress;
      // const ipv4Address = ipAddress.replace(/^.*:/, '');

      // console.log(ipv4Address, req.ip, req.socket.remoteAddress);

      dns.lookup(require('os').hostname(), (err, address, family) => {
        if (err) {
          console.error(err);
          return;
        }

        console.log(`Your wifi IP address is ${address}`);
      });

      // const isExists = await this.findOneRefProject(project);
      // if (isExists)
      //   throw new HttpException(
      //     'wiffi đã được cài đặt trướt đó!',
      //     HttpStatus.FORBIDDEN,
      //   );
      // await this.projectService.isModelExist(project);
      // // check loggin wiffi
      // await this.logginWiffi(wiffi, password);
      // const created = await this.model.create({
      //   ...createRuleDto,
      //   workHour:
      //     lunchIn && lunchOut
      //       ? timeOut - timeIn - (lunchIn - lunchOut)
      //       : timeOut - timeIn,
      // });
      // this.logger.log(`created a new rules by id#${created?._id}`);
      // return created;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async update(id: string, updateRuleDto: UpdateRuleDto) {
    try {
      const {
        wiffi,
        wiffiOld,
        password,
        passwordOld,
        project,
        timeIn,
        timeOut,
        lunchIn,
        lunchOut,
      } = updateRuleDto;

      // check input project id
      await this.projectService.isModelExist(project);

      // assign api
      const updatedRules = this.model.findByIdAndUpdate(
        id,
        {
          ...updateRuleDto,
          workHour:
            lunchIn && lunchOut
              ? timeOut - timeIn - (lunchIn - lunchOut)
              : timeOut - timeIn,
        },
        {
          new: true,
        },
      );

      if (wiffi === wiffiOld && password === passwordOld) {
        const updated = await updatedRules;

        this.logger.log(`updated a rules by id#${updated?._id}`);

        return updated;
      }

      // check login wiffi
      await this.logginWiffi(wiffi, password);

      const updated = await updatedRules;

      this.logger.log(`updated a rules by id#${updated?._id}`);

      return updated;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  findOne(id: string) {
    return this.model.findById(id).lean();
  }

  findByIdProjects(wiffi: string, project: string) {
    return this.model.findOne({ wiffi, project }).lean();
  }

  async isModelExists(id, isOption = false, msg = '') {
    if (!id && isOption) return;
    const message = msg || 'Rule not found';
    const isExists = this.findOne(id);
    if (!isExists) throw new Error(message);
    return isExists;
  }

  async logginWiffi(wiffi, password) {
    // check login wiffi
    var _ap = {
      ssid: wiffi,
      password: password,
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

      console.log(response);

      if (!response.success)
        throw new Error('Tên wiffi hoặc mật khẩu không chính xác!');
    });

    return res;
  }
}
