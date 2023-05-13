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
import { QueryAttendanceDto } from './dto/query-attendance.dto';
import { OvertimeService } from 'src/overtime/overtime.service';
import { OvertimeTypeEnum } from 'src/overtime/enum/type-overtime.enum';
import { QueryCheckUpdateOvertimeDto } from './dto/query-checkUpdateOvertime.dto';
import * as scanner from 'node-wifi-scanner';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { BULLL_NAME } from './contants/bull.name';
const wifi = require('node-wifi');
const si = require('systeminformation');
// const scanner = require('node-wifi-scanner');

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
    @Inject(forwardRef(() => OvertimeService))
    private readonly overtimeService: OvertimeService,
    @InjectQueue(BULLL_NAME) private attendanceQueue: Queue,
  ) {}

  async getAttendancePersonal(queryAttendanceDto: QueryAttendanceDto) {
    return await this.model.aggregate([
      {
        $match: {
          $expr: {
            $eq: ['$user', { $toObjectId: queryAttendanceDto.user }],
          },
        },
      },
      {
        $match: {
          $expr: {
            $eq: ['$project', { $toObjectId: queryAttendanceDto.project }],
          },
        },
      },
      {
        $match: {
          month: new Date().getMonth() + 1,
        },
      },
      {
        $sort: {
          datetime: -1,
        },
      },
    ]);
  }

  async toDayAttendanceByIdUser(queryAttendanceDto: QueryAttendanceDto) {
    const query = await this.model.aggregate([
      {
        $match: {
          $expr: {
            $and: [
              { $eq: ['$year', +queryAttendanceDto.year] },
              { $eq: ['$month', +queryAttendanceDto.month] },
              { $eq: ['$date', +queryAttendanceDto.date] },
              {
                $eq: ['$project', { $toObjectId: queryAttendanceDto.project }],
              },
            ],
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'users',
        },
      },
      {
        $unwind: '$users',
      },
      {
        $match: {
          $expr: {
            $eq: ['$users._id', { $toObjectId: queryAttendanceDto.user }],
          },
        },
      },
      {
        $lookup: {
          from: 'overtimes',
          localField: '_id',
          foreignField: 'attendance',
          as: 'overtime',
        },
      },
      {
        $unwind: {
          path: '$overtime',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: {
            year: '$year',
            month: '$month',
            date: '$date',
          },
          totalWorkHour: {
            $sum: '$workHour',
          },
          overtimeMorning: {
            $sum: {
              $cond: {
                if: { $eq: ['$overtime.type', OvertimeTypeEnum.MORNING] },
                then: '$workHour',
                else: 0,
              },
            },
          },
          overtimeEvernings: {
            $sum: {
              $cond: {
                if: { $eq: ['$overtime.type', OvertimeTypeEnum.EVERNINGS] },
                then: '$workHour',
                else: 0,
              },
            },
          },
          timein: {
            $push: '$timein',
          },
          timeout: {
            $push: '$timeout',
          },
        },
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          date: '$_id.date',
          totalWorkHour: '$totalWorkHour',
          overtimeMorning: '$overtimeMorning',
          overtimeEvernings: '$overtimeEvernings',
          time: { $concatArrays: ['$timein', '$timeout'] },
        },
      },
      {
        $unwind: {
          path: '$time',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: {
          time: 1,
        },
      },
      {
        $group: {
          _id: {
            year: '$year',
            month: '$month',
            date: '$date',
            totalWorkHour: '$totalWorkHour',
            overtimeMorning: '$overtimeMorning',
            overtimeEvernings: '$overtimeEvernings',
          },
          times: {
            $push: '$time',
          },
        },
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          date: '$_id.date',
          totalWorkHour: '$_id.totalWorkHour',
          overtimeMorning: '$_id.overtimeMorning',
          overtimeEvernings: '$_id.overtimeEvernings',
          times: '$times',
        },
      },
    ]);

    return query[0] || {};
  }

  async toDayAllAttendance(queryAttendanceDto: QueryAttendanceDto) {
    const { user, project, date, month, year } = queryAttendanceDto;
    return await this.model
      .find({ user, project, date, month, year })
      .sort({ timein: 1 });
  }

  async toDayAttendance(queryAttendanceDto: QueryAttendanceDto) {
    return await this.model.findOne(queryAttendanceDto).lean();
  }

  async checkRules(wiffi: string, project: string) {
    const rules = await this.rulesService.findByIdProjects(wiffi, project);

    if (!rules)
      throw new HttpException(
        `${wiffi} không phải wiffi chấm công của dự án!`,
        HttpStatus.FORBIDDEN,
      );

    return rules;
  }

  async createOrUpdate(updateAttendanceDto: UpdateAttendanceDto) {
    const { user, project, wiffi } = updateAttendanceDto;
    try {
      // check input data
      await Promise.all([
        this.userService.isModelExist(user),
        this.projectService.isModelExist(project),
        this.checkRules(wiffi, project),
      ]);

      const toDate = {
        date: new Date().getDate(),
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      };

      // [ shifts ]
      const isShifts = await this.overtimeService.toDayOvertimeOfIndividual({
        user,
        project,
        type: OvertimeTypeEnum.SHIFTS,
        ...toDate,
      });

      // { attendance }
      const attendance = await this.toDayAttendance({
        user,
        project,
        ...toDate,
        timeout: 0,
      });

      // { attendance }
      const uniqueAttendance = await this.toDayAttendance({
        user,
        project,
        ...toDate,
      });

      // [ attendance ]
      const toDayAllAttendance = await this.toDayAllAttendance({
        project,
        user,
        ...toDate,
      });

      // to day overtime sort -> timein: 1
      const todayOvertime =
        await this.overtimeService.toDayOvertimeOfIndividual({
          project,
          user,
          ...toDate,
        });

      if (
        toDayAllAttendance.length === todayOvertime.length &&
        todayOvertime.length > 0 &&
        attendance === null
      )
        throw new HttpException(
          `Bạn đã chấm công đủ ${todayOvertime.length * 2} lần!`,
          HttpStatus.FORBIDDEN,
        );

      if (uniqueAttendance?.timeout > 0 && isShifts.length === 0)
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

      if (attendance?.timeout === 0 && attendance?.timein > 0) {
        return this.checkUpdateOverTime({
          project,
          user,
          attendanceId: attendance?._id.toString(),
          todayOvertime,
          // FIXME:
          timeout: 74100,
          attendance,
          toDate,
        });
      }
      console.log(4);

      const created: any = await this.create({
        user,
        project,
        // FIXME:
        timein: 28500,
        timeinShifts: 28500,
        // timeinShifts: time,
      });

      return created;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  // ** not overtime -> 1 created, 2 updated workhours.

  // ** have overtime but not shifts ->
  // 1. update overtime field attendanceId.
  // 2. update workhour

  // ** have shifts, not overtime
  // 1. update overtime field attendanceId. ( many attendance )
  // 2. update workhour

  // ** have shifts and overtime
  // I. many attendance:
  // 1. update overtime field attendanceId.
  // 2. update workhour
  // II. one attendance:
  // 1. update overtime field attendanceId, update workhour.
  // 2. create attendance, update overtime field attendanceId.

  async checkUpdateOverTime(query: QueryCheckUpdateOvertimeDto) {
    try {
      const {
        user,
        project,
        timeout,
        todayOvertime,
        attendanceId,
        attendance,
        toDate,
      } = query;
      // [ attendance ]
      const { shiftsAll } = await this.getDataNecessary(user, project);

      // ------------------------------ data necsessary gobal ---------------------------------

      //  TODO: exp: [1, 2, timeout = 3 , 5, 6] --- [ovtstart, timeout = 3 , ovtend]
      // [ overtime ] by item.timeout <= timeout

      const ovtstart: any = todayOvertime
        .filter((i) => i.timeout <= timeout)
        .sort((a, b) => a.timein - b.timein);

      // last in array ovtstart
      const ovts = ovtstart[ovtstart.length - 1];

      // [ overtime ] by item.timeout >= timeout
      const ovtend = todayOvertime
        .filter((i) => i.timeout > timeout)
        .sort((a, b) => a.timein - b.timein);

      // first in array ovted
      const ovte: any = ovtend[0];

      // console.log(timeout);
      const overtimeStandard =
        ovte?.timeout - timeout > timeout - ovts?.timeout ? ovtstart : ovte;

      // ------------------------------ data necsessary gobal ---------------------------------

      if (
        shiftsAll.length > 0 &&
        overtimeStandard === ovtstart &&
        ovtstart.length > 0
      ) {
        let update = false;
        ovtstart.sort((a, b) => a.timein - b.timein);
        console.log('start');

        if (ovtstart[0]?._id && !ovtstart[0]?.attendance) {
          await this.overtimeService.updateFieldAttendance(ovtstart[0]?._id, {
            attendanceId,
          });
          await this.update(attendanceId, {
            project,
            user,
            timeout,
            overtimeQuery: ovtstart[0],
            shiftsAll,
          });
          update = true;
        }

        if (ovtstart[1] && !ovtstart[1]?.attendance) {
          if (attendance?.timeout === 0 && update === false) {
            await this.overtimeService.updateFieldAttendance(ovtstart[1]?._id, {
              attendanceId,
            });

            await this.update(attendanceId, {
              project,
              user,
              timeout,
              overtimeQuery: ovtstart[1],
              shiftsAll,
            });
          } else {
            const ovt1 = ovtstart[1];
            return await this.createAttendanceAndUpdateOvertime({
              user,
              project,
              overtimeId: ovt1._id,
              toDate,
              timein: ovt1.timein,
              timeout: timeout >= ovt1.timeout ? ovt1.timeout : timeout,
            });
          }
        }
      }

      if (shiftsAll.length > 0 && overtimeStandard === ovte) {
        console.log('end');
        if (!ovtstart[ovtstart.length - 1] && ovte && !ovte.attendance) {
          await this.overtimeService.updateFieldAttendance(ovte?._id, {
            attendanceId,
          });

          await this.update(attendanceId, {
            project,
            user,
            timeout,
            overtimeQuery: ovte,
            shiftsAll,
          });
        }

        if (ovtstart[ovtstart.length - 1] && ovte && !ovte?.attendance) {
          const ovts = ovtstart[ovtstart.length - 1];
          let update = false;
          // start
          if (ovts && !ovts?.attendance) {
            await this.overtimeService.updateFieldAttendance(ovts?._id, {
              attendanceId,
            });

            await this.update(attendanceId, {
              project,
              user,
              timeout,
              overtimeQuery: ovts,
              shiftsAll,
            });

            update = true;
          }

          // end
          if (attendance?.timeout === 0 && update === false) {
            console.log(8);

            await this.overtimeService.updateFieldAttendance(ovte?._id, {
              attendanceId,
            });

            await this.update(attendanceId, {
              project,
              user,
              timeout,
              overtimeQuery: ovte,
              shiftsAll,
            });
          } else {
            console.log(9);

            return await this.createAttendanceAndUpdateOvertime({
              user,
              project,
              overtimeId: ovte._id,
              toDate,
              timein:
                attendance.timein <= ovte.timein
                  ? ovte.timein
                  : attendance.timein,
              timeout: timeout >= ovte.timeout ? ovte.timeout : timeout,
            });
          }
        }

        if (ovtstart[ovtstart.length - 1] && !ovte) {
          const ovts1 = ovtstart[ovtstart.length - 1];
          const ovts2 = ovtstart[ovtstart.length - 2];
          let updated = false;
          console.log(99);

          if (ovts2 && !ovts2.attendance) {
            await this.overtimeService.updateFieldAttendance(ovts2?._id, {
              attendanceId,
            });

            await this.update(attendanceId, {
              project,
              user,
              timeout,
              overtimeQuery: ovts2,
              shiftsAll,
            });

            updated = true;
          }

          if (ovts1 && !ovts1.attendance && updated === false) {
            await this.overtimeService.updateFieldAttendance(ovts1?._id, {
              attendanceId,
            });

            await this.update(attendanceId, {
              project,
              user,
              timeout,
              overtimeQuery: ovts1,
              shiftsAll,
            });
          } else {
            return await this.createAttendanceAndUpdateOvertime({
              user,
              project,
              overtimeId: ovts1._id,
              toDate,
              timein: ovts1.timein,
              timeout: timeout >= ovts1.timeout ? ovts1.timeout : timeout,
            });
          }
        }
      }

      // ** have overtime but not shifts ------------------------------
      if (todayOvertime.length > 0 && shiftsAll.length === 0 && timeout) {
        console.log('todayovertime');

        const overtimeMorning: any = todayOvertime.find(
          (i) => i.type === OvertimeTypeEnum.MORNING,
        );

        const overtimeEvernings: any = todayOvertime.find(
          (i) => i.type === OvertimeTypeEnum.EVERNINGS,
        );

        if (overtimeMorning && attendance.timein < overtimeMorning.timeout) {
          this.createAttendanceAndUpdateOvertime({
            user,
            project,
            timein:
              attendance.timein <= overtimeMorning.timein
                ? overtimeMorning.timein
                : attendance.timein,
            timeout:
              timeout >= overtimeMorning.timeout
                ? overtimeMorning.timeout
                : timeout,
            overtimeId: overtimeMorning._id,
            toDate,
          });
        }

        if (
          overtimeEvernings &&
          attendance.timein < overtimeEvernings.timeout
        ) {
          this.createAttendanceAndUpdateOvertime({
            user,
            project,
            timein:
              attendance.timein <= overtimeEvernings.timein
                ? overtimeEvernings.timein
                : attendance.timein,
            timeout:
              timeout >= overtimeEvernings.timeout
                ? overtimeEvernings.timeout
                : timeout,
            overtimeId: overtimeEvernings._id,
            toDate,
          });
        }

        return await this.update(attendanceId, { project, user, timeout });
      }

      // ** if not overtime ------------------------------
      if (todayOvertime.length === 0) {
        console.log('not overtime');
        return await this.update(attendanceId, { project, user, timeout });
      }

      // return await this.update(attendanceId, { project, user, timeout });
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async createAttendanceAndUpdateOvertime(payload: {
    overtimeId: string;
    user: string;
    project: string;
    timein: number;
    timeout: number;
    toDate;
  }) {
    const { user, project, timein, timeout, toDate, overtimeId } = payload;
    console.log(2);

    try {
      const rules = await this.rulesService.findOneRefProject(project);
      const workHour =
        timein < rules.lunchOut && timeout > rules.lunchIn
          ? timeout - timein - (rules.lunchIn - rules.lunchOut)
          : timeout - timein;
      this.logger.debug(`work hour ${workHour}`);
      var created: any = await this.create({
        user,
        project,
        timein: timein,
        timeout: timeout,
        timeoutShifts: timeout,
        timeinShifts: timein,
        workHour,
        ...toDate,
      });
      console.log(3);

      return await this.overtimeService.updateFieldAttendance(overtimeId, {
        attendanceId: created?._id,
      });
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async create(createAttendanceDto: CreateAttendanceDto): Promise<Attendance> {
    try {
      //  ----------------------------- create ------------------------
      const created = await this.model.create({
        ...createAttendanceDto,
      });

      this.logger.log(`Created a new attendance by id#${created?._id}`);

      return created;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async update(id: string, updateAttendanceDto: UpdateAttendanceDto) {
    // ): Promise<Attendance> {
    const { project, user, timeout, overtimeQuery, shiftsAll } =
      updateAttendanceDto;
    try {
      // check input data
      await Promise.all([
        this.userService.isModelExist(user),
        this.projectService.isModelExist(project),
      ]);

      // check input get data timein
      const { timein } = await this.isModelExists(id);

      const rules = await this.rulesService.findOneRefProject(project);

      // workhours of each shifts
      const workhours = await this.workHour(
        project,
        user,
        timein,
        timeout,
        id,
        overtimeQuery,
        rules,
      );

      // payload when there is no overtime type = shifts
      let payload = {
        workHour: workhours,
        timeout,
        timeoutShifts: timeout >= rules.timeOut ? rules.timeOut : timeout,
        timeinShifts: timein <= rules.timeIn ? rules.timeIn : timein,
      };

      // payload when there is  overtime type = shifts

      if (shiftsAll?.length > 0) {
        payload = {
          ...payload,
          timeoutShifts:
            timeout >= overtimeQuery.timeout ? overtimeQuery.timeout : timeout,
          timeinShifts:
            timein <= overtimeQuery.timein ? overtimeQuery.timein : timein,
        };
      }

      const updated = await this.model.findByIdAndUpdate(id, payload, {
        new: true,
      });

      this.logger.log(`updated a attendance by id#${updated?._id}`);

      return updated;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async workHour(
    project,
    user,
    timein,
    timeout,
    attendanceId,
    overtimeQuery,
    rules,
  ) {
    const {
      overtimeMorning,
      overtimeEvernings,
      shiftsAll,
      todayOvertime,
      toDayAllAttendance,
    } = await this.getDataNecessary(user, project);

    // ------------------------ official working hours not overtime ----------------------------
    if (todayOvertime.length === 0) {
      const timeinStandard = timein <= rules.timeIn ? rules.timeIn : timein;
      const timeoutStandard =
        timeout >= rules.timeOut ? rules.timeOut : timeout;
      // have overtime morning but havn't overtime everning
      if (rules.lunchIn && rules.lunchOut) {
        this.logger.debug(
          `not overtime workhour ${
            timeoutStandard - timeinStandard - (rules.lunchIn - rules.lunchOut)
          }`,
        );

        return (
          timeoutStandard - timeinStandard - (rules.lunchIn - rules.lunchOut)
        );
      }

      return timeoutStandard - timeinStandard;
    }

    //  ----------------------- work in shift not overtime or overtime -------------------------
    if (shiftsAll.length > 0) {
      const timeinStandard =
        timein <= overtimeQuery.timein ? overtimeQuery.timein : timein;

      const timeoutStandard =
        timeout >= overtimeQuery.timeout ? overtimeQuery.timeout : timeout;

      if (timeinStandard < rules.lunchOut && timeoutStandard > rules.lunchIn) {
        this.logger.debug(
          `shifts ${
            timeoutStandard - timeinStandard - (rules.lunchIn - rules.lunchOut)
          } have lunch`,
        );
        return (
          timeoutStandard - timeinStandard - (rules.lunchIn - rules.lunchOut)
        );
      }

      this.logger.debug(`shifts ${timeoutStandard - timeinStandard} not lunch`);

      return timeoutStandard - timeinStandard;
    }

    //  ----------------------- have overtime not shifts, have go work hours 9 -------------------------

    if (shiftsAll.length === 0 && todayOvertime.length > 0) {
      const timeinStandard = timein <= rules.timeIn ? rules.timeIn : timein;
      const timeoutStandard =
        timeout >= rules.timeOut ? rules.timeOut : timeout;

      // have overtime morning but havn't overtime everning
      if (rules.lunchIn && rules.lunchOut) {
        this.logger.debug(
          `shifts main have overtime have lunch workhour ${
            timeoutStandard - timeinStandard - (rules.lunchIn - rules.lunchOut)
          }`,
        );

        return (
          timeoutStandard - timeinStandard - (rules.lunchIn - rules.lunchOut)
        );
      }

      this.logger.debug(
        `shifts main have overtime not lunch workhour ${
          timeoutStandard - timeinStandard
        }`,
      );

      return timeoutStandard - timeinStandard;
    }
  }

  async getDataNecessary(user, project) {
    try {
      const toDay = {
        year: new Date().getFullYear(),
        date: new Date().getDate(),
        month: new Date().getMonth() + 1,
      };
      const query = {
        user,
        project,
        ...toDay,
      };

      // { rules } || null
      const rules = await this.rulesService.findOneRefProject(project);
      // { overtimeMorning } || null
      const overtimeMorning =
        await this.overtimeService.findOneToDayOvertimeOfIndividual({
          ...query,
          type: OvertimeTypeEnum.MORNING,
        });

      // { overtimeEvernings } || null
      const overtimeEvernings =
        await this.overtimeService.findOneToDayOvertimeOfIndividual({
          ...query,
          type: OvertimeTypeEnum.EVERNINGS,
        });

      // [ shiftsAll ] sort -> timein: 1
      const shiftsAll = await this.overtimeService.toDayOvertimeOfIndividual({
        ...query,
        type: OvertimeTypeEnum.SHIFTS,
      });

      // [ todayOvertime ]
      const todayOvertime =
        await this.overtimeService.toDayOvertimeOfIndividual(query);

      // [ toDayAllAttendance ]
      const toDayAllAttendance = await this.toDayAllAttendance(query);

      return {
        rules,
        overtimeMorning,
        overtimeEvernings,
        shiftsAll,
        todayOvertime,
        toDayAllAttendance,
      };
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async fetchWiffi(res: Response) {
    try {
      si.wifiNetworks((networks, error) => {
        if (error) {
          console.log(error, 999);
          throw new Error(error);
        }

        return res.status(200).json(networks);
      });
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  findOne(id: string) {
    return this.model.findById(id).lean();
  }

  async manually(createAttendanceDto: CreateAttendanceDto) {
    try {
      return await this.attendanceQueue.add(createAttendanceDto);
    } catch (error) {
      this.logger.error(error?.message, error?.stack);
      throw new BadRequestException(error);
    }
  }

  async isModelExists(id, isOptional = false, msg = '') {
    if (!id && isOptional) return;
    const message = msg || 'Attendance not fount!';
    const isExists = await this.findOne(id);
    if (!isExists) throw new Error(message);
    return isExists;
  }
}
