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
import { Response } from 'express';
import { Model } from 'mongoose';
import { ProjectService } from 'src/project/project.service';
import { UserService } from 'src/user/user.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { Attendance, AttendanceDocument } from './schema/attendance.schema';
import * as WiFiControl from 'wifi-control';
import { RulesService } from 'src/rules/rules.service';
@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(
    @InjectModel(Attendance.name) private model: Model<AttendanceDocument>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => ProjectService))
    private readonly projectService: ProjectService,
    @Inject(forwardRef(() => RulesService))
    private readonly rulesService: RulesService,
  ) {}

  async getAttendancePersonal(query: { user: string }) {
    const data = await this.model.aggregate([]);

    return { data };
  }

  async toDayAttendance(user: string, project: string, date: number) {
    return await this.model.findOne({ user, project, date }).lean();
  }

  async create(createAttendanceDto: CreateAttendanceDto) {
    try {
      const { user, project, wiffi } = createAttendanceDto;
      // check input data
      await Promise.all([
        this.userService.isModelExist(user),
        this.projectService.isModelExist(project),
      ]);

      const rules = await this.rulesService.findByIdProjects(wiffi, project);

      if (!rules)
        throw new HttpException(
          `${wiffi} không phải wiffi chấm công của dự án!`,
          HttpStatus.FORBIDDEN,
        );

      const attendance = await this.toDayAttendance(
        user,
        project,
        new Date().getDate(),
      );

      if (attendance.timeout > 0)
        throw new HttpException(
          `Bạn đã chấm công 2 lần trong ngày!`,
          HttpStatus.FORBIDDEN,
        );

      // format date time
      const datetime = Date.now();
      const hour = new Date(datetime).getHours();
      const minute = new Date(datetime).getMinutes();
      const time = hour * 3600 + minute * 60;

      //  ----------------------------- update ------------------------
      if (attendance.timeout === 0) {
        const updated = this.update(attendance._id.toString(), {
          user,
          project,
          timeout: time,
        });
      }

      const created = await this.model.create({
        ...createAttendanceDto,
        datetime,
        time,
      });

      this.logger.log(`Created a new attendance by id#${created?._id}`);

      return created;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async update(id: string, updateAttendanceDto: UpdateAttendanceDto) {
    try {
      // check input data
      await Promise.all([
        this.userService.isModelExist(updateAttendanceDto.user),
        this.projectService.isModelExist(updateAttendanceDto.project),
      ]);

      const updated = await this.model.findByIdAndUpdate(
        id,
        updateAttendanceDto,
        { new: true },
      );

      this.logger.log(`updated a attendance by id#${updated?._id}`);

      return updated;
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
