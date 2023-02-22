import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Response } from 'express';
import { Model } from 'mongoose';
import { ProjectService } from 'src/project/project.service';
import { UserService } from 'src/user/user.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { Attendance, AttendanceDocument } from './schema/attendance.schema';
import * as WiFiControl from 'wifi-control';
@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(
    @InjectModel(Attendance.name) private model: Model<AttendanceDocument>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => ProjectService))
    private readonly projectService: ProjectService,
  ) {}

  async create(createAttendanceDto: CreateAttendanceDto) {
    try {
      // check input data
      await Promise.all([
        this.userService.isModelExist(createAttendanceDto.user),
        this.projectService.isModelExist(createAttendanceDto.project),
      ]);
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
      return 'This action adds a new attendance';
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async fetchWiffi(res: Response) {
    try {
      //  Initialize wifi-control package with verbose output
      WiFiControl.init({
        debug: true,
      });

      //  Try scanning for access points:
      WiFiControl.scanForWiFi(function (err, response) {
        if (err) console.log(err);
        if (response.networks) res.status(200).json(response.networks);
      });
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  findOne(id: string) {
    return this.model.findById(id).lean();
  }

  async isModelExists(id, isOptional = false, msg = '') {
    if (!id && isOptional) return;
    const message = msg || 'Attendance not fount!';
    const isExists = await this.model.findOne(id);
    if (!isExists) throw new Error(message);
    return isExists;
  }
}
