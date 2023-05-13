import { Processor, Process, OnQueueActive } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { OvertimeService } from 'src/overtime/overtime.service';
import { ProjectService } from 'src/project/project.service';
import { UserService } from 'src/user/user.service';
import { AttendanceService } from './attendance.service';
import { BULLL_NAME } from './contants/bull.name';
import { CreateAttendanceDto } from './dto/create-attendance.dto';

@Processor(BULLL_NAME)
export class AttendanceConsumer {
  private readonly logger = new Logger(AttendanceConsumer.name);
  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly overtimeService: OvertimeService,
    private readonly userService: UserService,
    private readonly projectService: ProjectService,
  ) {}
  @Process()
  async consumer(job: Job<CreateAttendanceDto>) {
    const { overtime, user, project, creator, ...data } = job.data;

    await this.projectService.isModelExist(project);

    await this.userService.isModelExist(creator);

    for await (const id of JSON.parse(user)) {
      await this.userService.isModelExist(id);
    }

    for await (const id of JSON.parse(user)) {
      // create attendace
      const payload = {
        year: data.year,
        month: data.month,
        date: data.date,
        datetime: data.datetime,
        project,
        user: id,
        timein: data.timein,
        timeout: data.timeout,
        workHour: data.workHour,
        timeinShifts: job.data.timein,
        timeoutShifts: job.data.timeout,
      };

      const attendance: any = await this.attendanceService.create(payload);

      //   create overtime
      if (overtime) {
        const payload = {
          datetime: data.datetime,
          timein: data.timein,
          timeout: data.timeout,
          type: overtime,
          attendance: attendance._id,
          project,
          user: id,
        };

        await this.overtimeService.createManually(payload);
      }
    }

    return;
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.debug(
      `Processing job ${job.id} of type ${job.name} with data ${job.data}...`,
    );
  }
}
