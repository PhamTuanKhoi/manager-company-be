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
import { UserService } from 'src/user/user.service';
import { CreateOvertimeDto } from './dto/create-overtime.dto';
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
  ) {}
  async create(createOvertimeDto: CreateOvertimeDto) {
    const { userIds, project } = createOvertimeDto;
    try {
      // check id input
      const isExistUser = userIds.map((id) =>
        this.userService.isModelExist(id),
      );

      await Promise.all([
        ...isExistUser,
        this.projectService.isModelExist(project),
      ]);

      const isInsert = userIds.map((id) => ({
        ...createOvertimeDto,
        user: id,
      }));

      const created = await this.model.insertMany(isInsert);

      const updateAttendanceAPI = created.map((i) => {
        return this.attendanceService.updateFieldOvertime({
          overtime: i._id.toString(),
          project,
          user: i.user.toString(),
          date: new Date().getDate(),
          month: new Date().getMonth() + 1,
          year: new Date().getDate(),
        });
      });

      await Promise.all(updateAttendanceAPI);

      this.logger.log(`insert ${created.length} overtime success`);

      return created;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  findAll() {
    return `This action returns all overtime`;
  }

  update(id: number, updateOvertimeDto: UpdateOvertimeDto) {
    return `This action updates a #${id} overtime`;
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
