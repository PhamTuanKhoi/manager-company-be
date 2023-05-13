import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AttendanceService } from 'src/attendance/attendance.service';
import { ProjectService } from 'src/project/project.service';
import { RulesService } from 'src/rules/rules.service';
import { UserService } from 'src/user/user.service';
import { CreateOvertimeDto } from './dto/create-overtime.dto';
import { QueryOvertimeDto } from './dto/query-overtime.dto';
import { UpdateOvertimeDto } from './dto/update-overtime.dto';
import { Overtime, OvertimeDocument } from './schema/overtime.schema';

@Injectable()
export class OvertimeService {
  private readonly logger = new Logger(OvertimeService.name);

  constructor(
    @InjectModel(Overtime.name) private model: Model<OvertimeDocument>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => ProjectService))
    private readonly projectService: ProjectService,
    @Inject(forwardRef(() => AttendanceService))
    private readonly attendanceService: AttendanceService,
    @Inject(forwardRef(() => RulesService))
    private readonly rulesService: RulesService,
  ) {}
  async create(createOvertimeDto: CreateOvertimeDto) {
    const { userIds, project, timein } = createOvertimeDto;
    try {
      // check id input
      const isExistUser = userIds.map((id) =>
        this.userService.isModelExist(id),
      );

      await Promise.all([
        ...isExistUser,
        this.projectService.isModelExist(project),
      ]);

      //  get rules by project
      const rule = await this.rulesService.findOneRefProject(project);

      const isInsert = userIds.map((id) => ({
        ...createOvertimeDto,
        user: id,
      }));

      const created = await this.model.insertMany(isInsert);

      this.logger.log(`insert ${created.length} overtime success`);

      return created;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async createManually(createOvertimeDto: CreateOvertimeDto) {
    try {
      const created = await this.model.create(createOvertimeDto);

      this.logger.log(`created a new overtime by id#${created?._id}`);

      return created;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async toDayOvertimeOfIndividual(queryOvertimeDto: QueryOvertimeDto) {
    return this.model.find(queryOvertimeDto).sort({ timein: 1 });
  }

  async findOneToDayOvertimeOfIndividual(queryOvertimeDto: QueryOvertimeDto) {
    return this.model.findOne(queryOvertimeDto).lean();
  }

  async updateFieldAttendance(id: string, payload: { attendanceId: string }) {
    try {
      await this.isModelExists(id);

      const updated = await this.model.findByIdAndUpdate(
        id,
        { attendance: payload.attendanceId },
        {
          new: true,
        },
      );

      this.logger.log(`updated field attendance by id#${updated?._id}`);

      return updated;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async findOne(id: string) {
    return this.model.findById(id).lean();
  }

  async isModelExists(id, isOpition = false, mes = '') {
    if (!id && isOpition) return;
    const message = mes || 'overtime not found';
    const isExist = await this.findOne(id);
    if (!isExist) throw new Error(message);
  }
}
