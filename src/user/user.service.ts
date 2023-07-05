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
import { Model, PipelineStage } from 'mongoose';
import { CreateUserDto } from './dto/create-dto/create-user.dto';
import { RegisterUserDto } from './dto/create-dto/register-user.dto';
import { UserRoleEnum } from './interfaces/role-user.enum';
import { User, UserDocument } from './schema/user.schema';
import * as bcrypt from 'bcrypt';
import { CreateEmployeeDto } from './dto/create-dto/create-employee.dto';

import { UpdateEmployeesDto } from './dto/update-dto/update-employees.dto';
import { CreateClientDto } from './dto/create-dto/create-client.dto';
import { SendEmail } from 'src/gobal/email/sendMail';
import { UpdateClientDto } from './dto/update-dto/update-client.dto';
import { CreateWorkerDto } from './dto/create-dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-dto/update-worker.dto';
import { QueryWorkerProject } from './interfaces/worker-assign-query';
import { QueryNotificationMessage } from './interfaces/notification-message-query copy';
import { ConfigService } from '@nestjs/config';
import { QueryUserAttendanceDto } from './dto/query-dto/query-user-attendance.dto';
import { QueryUserSalaryDto } from './dto/query-dto/query-user-salary.dto';
import { QueryUserPayrollDto } from './dto/query-dto/query-user-payroll.dto';
import { RulesService } from '../rules/rules.service';
import { OvertimeTypeEnum } from 'src/overtime/enum/type-overtime.enum';
import { QueryUserOvertimeDto } from './dto/query-dto/query-user-overtime';
import { UpdatePasswordDto } from './dto/update-dto/update-password.dto';
import { QueryUserDto } from './dto/query-dto/query-user.dto';
import * as jwt from 'jsonwebtoken';
import { ResetPasswordDto } from './dto/update-dto/reset-password.dto';
import { jwtConstant } from './constants/constants';
import { UpdateStatusDto } from './dto/update-dto/update-status.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectModel(User.name) private model: Model<UserDocument>,
    @Inject(forwardRef(() => RulesService))
    private readonly rulesService: RulesService,
    private configService: ConfigService,
  ) {}

  async findAllEloyees(queryUserDto: QueryUserDto) {
    const { project, role, departmentId, userId } = queryUserDto;

    let query: any = [
      {
        $match: {
          $expr: {
            $or: [
              {
                $eq: ['$role', UserRoleEnum.EMPLOYEE],
              },
              {
                $eq: ['$role', UserRoleEnum.LEADER],
              },
            ],
          },
        },
      },
      {
        $lookup: {
          from: 'joinprojects',
          localField: '_id',
          foreignField: 'joinor',
          as: 'joinproject',
        },
      },
      {
        $unwind: {
          path: '$joinproject',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'departments',
          localField: 'department',
          foreignField: '_id',
          as: 'department',
        },
      },
      {
        $unwind: {
          path: '$department',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: {
            _id: '$_id',
            email: '$email',
            name: '$name',
            mobile: '$mobile',
            department: '$department.name',
            departmentId: '$department._id',
            date: '$date',
            cccd: '$cccd',
            role: '$role',
            address: '$address',
            avatar: '$avatar',
          },
        },
      },
      {
        $project: {
          _id: '$_id._id',
          email: '$_id.email',
          name: '$_id.name',
          mobile: '$_id.mobile',
          departmentName: '$_id.department',
          departmentId: '$_id.departmentId',
          date: '$_id.date',
          cccd: '$_id.cccd',
          role: '$_id.role',
          address: '$_id.address',
          avatar: '$_id.avatar',
        },
      },
      {
        $match: {
          $expr: {
            $ne: ['$_id', { $toObjectId: userId }],
          },
        },
      },
      {
        $sort: {
          _id: -1,
        },
      },
    ];

    if (project && role) {
      query.splice(
        5,
        0,
        {
          $match: {
            $expr: {
              $eq: ['$joinproject.project', { $toObjectId: project }],
            },
          },
        },
        {
          $match: {
            'joinproject.role': role,
          },
        },
      );
    }

    if (departmentId) {
      query = [
        ...query,
        {
          $match: {
            $expr: {
              $eq: ['$departmentId', { $toObjectId: departmentId }],
            },
          },
        },
      ];
    }

    return this.model.aggregate(query);
  }

  async findAllWorkerExcellent() {
    return await this.model.aggregate([
      {
        $match: {
          role: UserRoleEnum.WORKER,
        },
      },
      {
        $match: {
          excellent: true,
        },
      },
    ]);
  }

  async findWorkerByProjectId(query: { projectId: string }) {
    let pipe: Exclude<
      PipelineStage,
      PipelineStage.Merge | PipelineStage.Out
    >[] = [];

    let pipeline: PipelineStage[] = [
      {
        $match: {
          role: UserRoleEnum.WORKER,
        },
      },
      {
        $lookup: {
          from: 'joinprojects',
          localField: '_id',
          foreignField: 'joinor',
          pipeline: pipe,
          as: 'joinprojects',
        },
      },
    ];

    if (query.projectId) {
      pipeline = [
        ...pipeline,
        {
          $match: {
            $expr: {
              $gt: [{ $size: '$joinprojects' }, 0],
            },
          },
        },
      ];
      pipe.push({
        $match: {
          $expr: {
            $eq: ['$project', { $toObjectId: query.projectId }],
          },
        },
      });
    }
    return this.model.aggregate(pipeline);
  }

  async notAssignPart(id: string) {
    return await this.model.aggregate([
      {
        $match: {
          role: UserRoleEnum.WORKER,
        },
      },
      {
        $lookup: {
          from: 'joinprojects',
          localField: '_id',
          foreignField: 'joinor',
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$project', { $toObjectId: id }],
                },
              },
            },
          ],
          as: 'joinprojectEX',
        },
      },
      {
        $addFields: {
          siznjoinproject: {
            $size: '$joinprojectEX',
          },
        },
      },
      {
        $match: {
          siznjoinproject: {
            $ne: 0,
          },
        },
      },
      {
        $lookup: {
          from: 'joinparts',
          localField: '_id',
          foreignField: 'joinor',
          as: 'joinpartEX',
        },
      },
      {
        $addFields: {
          siznjoinpart: {
            $size: '$joinpartEX',
          },
        },
      },
      {
        $match: {
          siznjoinpart: 0,
        },
      },
      {
        $project: {
          name: '$name',
          field: '$field',
        },
      },
    ]);
  }

  async notificationMessage(
    queryNotificationMessage: QueryNotificationMessage,
  ) {
    const data = await this.model.aggregate([
      {
        $match: {
          $expr: {
            $ne: ['$_id', { $toObjectId: queryNotificationMessage.id }],
          },
        },
      },
      {
        $lookup: {
          from: 'messageapis',
          localField: '_id',
          foreignField: 'users',
          as: 'userEX',
        },
      },
      {
        $unwind: '$userEX',
      },
      {
        $unwind: '$userEX.users',
      },
      {
        $match: {
          $expr: {
            $eq: [
              '$userEX.users',
              { $toObjectId: queryNotificationMessage.id },
            ],
          },
        },
      },
      {
        $match: {
          $expr: {
            $ne: ['$userEX.from', { $toObjectId: queryNotificationMessage.id }],
          },
        },
      },
      {
        $sort: {
          'userEX.createdAt': -1,
        },
      },
      {
        $group: {
          _id: {
            _id: '$_id',
            name: '$name',
            avartar: '$avartar',
          },
          message: {
            $push: '$userEX',
          },
        },
      },
      {
        $project: {
          _id: '$_id._id',
          name: '$_id.name',
          avartar: '$_id.avartar',
          message: {
            $first: '$message',
          },
        },
      },
      {
        $unwind: '$message',
      },
      {
        $project: {
          messageid: '$message._id',
          from: '$_id',
          to: '$message.users',
          message: '$message.message',
          createdAt: '$message.createdAt',
          name: '$name',
          avartar: '$avartar',
        },
      },
    ]);

    return data;
  }

  async findAllEloyeesByUserId(queryUserDto: QueryUserDto) {
    const { userId, project, role, departmentId } = queryUserDto;

    let query: any = [
      {
        $match: {
          $expr: {
            $eq: ['$_id', { $toObjectId: userId }],
          },
        },
      },
      {
        $lookup: {
          from: 'joinprojects',
          localField: '_id',
          foreignField: 'joinor',
          as: 'joinproject',
        },
      },
      {
        $unwind: '$joinproject',
      },
      {
        $lookup: {
          from: 'projects',
          localField: 'joinproject.project',
          foreignField: '_id',
          as: 'project',
        },
      },
      {
        $unwind: '$project',
      },
      {
        $lookup: {
          from: 'joinprojects',
          localField: 'project._id',
          foreignField: 'project',
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ['$role', UserRoleEnum.EMPLOYEE] },
                    { $eq: ['$role', UserRoleEnum.LEADER] },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: 'users',
                localField: 'joinor',
                foreignField: '_id',
                pipeline: [
                  {
                    $lookup: {
                      from: 'departments',
                      localField: 'department',
                      foreignField: '_id',
                      as: 'department',
                    },
                  },
                  {
                    $unwind: {
                      path: '$department',
                      preserveNullAndEmptyArrays: true,
                    },
                  },
                ],
                as: 'employees',
              },
            },
            {
              $unwind: '$employees',
            },
          ],
          as: 'joinprojected',
        },
      },
      {
        $unwind: {
          path: '$joinprojected',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: {
            _id: '$joinprojected.employees._id',
            email: '$joinprojected.employees.email',
            name: '$joinprojected.employees.name',
            mobile: '$joinprojected.employees.mobile',
            department: '$joinprojected.employees.department.name',
            departmentId: '$joinprojected.employees.department._id',
            date: '$joinprojected.employees.date',
            cccd: '$joinprojected.employees.cccd',
            address: '$joinprojected.employees.address',
            role: '$joinprojected.employees.role',
            avatar: '$joinprojected.employees.avatar',
          },
        },
      },
      {
        $project: {
          _id: '$_id._id',
          email: '$_id.email',
          name: '$_id.name',
          mobile: '$_id.mobile',
          departmentName: '$_id.department',
          departmentId: '$_id.departmentId',
          date: '$_id.date',
          cccd: '$_id.cccd',
          address: '$_id.address',
          role: '$_id.role',
          avatar: '$_id.avatar',
        },
      },
    ];

    if (project && role) {
      query.splice(
        7,
        0,
        {
          $match: {
            $expr: {
              $eq: ['$joinprojected.project', { $toObjectId: project }],
            },
          },
        },
        {
          $match: {
            'joinprojected.role': role,
          },
        },
      );
    }

    if (departmentId) {
      query = [
        ...query,
        {
          $match: {
            $expr: {
              $eq: ['$departmentId', { $toObjectId: departmentId }],
            },
          },
        },
      ];
    }

    return this.model.aggregate(query);
  }

  async findAllClientByEmployees(id: string) {
    return await this.model.aggregate([
      {
        $match: {
          $expr: {
            $eq: ['$_id', { $toObjectId: id }],
          },
        },
      },
      {
        $lookup: {
          from: 'joinprojects',
          localField: '_id',
          foreignField: 'joinor',
          as: 'joinproject',
        },
      },
      {
        $unwind: '$joinproject',
      },
      {
        $lookup: {
          from: 'projects',
          localField: 'joinproject.project',
          foreignField: '_id',
          as: 'project',
        },
      },
      {
        $unwind: '$project',
      },
      {
        $lookup: {
          from: 'joinprojects',
          localField: 'project._id',
          foreignField: 'project',
          pipeline: [
            {
              $match: {
                role: UserRoleEnum.CLIENT,
              },
            },
            {
              $lookup: {
                from: 'users',
                localField: 'joinor',
                foreignField: '_id',
                as: 'clients',
              },
            },
            {
              $unwind: '$clients',
            },
            {
              $project: {
                _id: '$clients._id',
                email: '$clients.email',
                name: '$clients.name',
                mobile: '$clients.mobile',
                company: '$clients.company',
                field: '$clients.field',
              },
            },
          ],
          as: 'joinprojected',
        },
      },
      {
        $unwind: {
          path: '$joinprojected',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: {
            _id: '$joinprojected._id',
            email: '$joinprojected.email',
            name: '$joinprojected.name',
            mobile: '$joinprojected.mobile',
            company: '$joinprojected.company',
            field: '$joinprojected.field',
            avatar: '$joinprojected.avatar',
          },
        },
      },
      {
        $project: {
          _id: '$_id._id',
          email: '$_id.email',
          name: '$_id.name',
          mobile: '$_id.mobile',
          company: '$_id.company',
          field: '$_id.field',
          avatar: '$_id.avatar',
        },
      },
    ]);
  }

  async findClientByProjectId(id: string) {
    const query = await this.model.aggregate([
      {
        $match: {
          role: UserRoleEnum.CLIENT,
        },
      },
      {
        $lookup: {
          from: 'joinprojects',
          localField: '_id',
          foreignField: 'joinor',
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$project', { $toObjectId: id }],
                },
              },
            },
          ],
          as: 'joinprojects',
        },
      },
      {
        $match: {
          $expr: {
            $gt: [{ $size: '$joinprojects' }, 0],
          },
        },
      },
      {
        $project: {
          email: '$email',
          name: '$name',
          mobile: '$mobile',
          company: '$company',
          field: '$field',
          tax: '$tax',
        },
      },
    ]);

    return query.length > 0 ? query[0] : [];
  }

  findAllClient() {
    return this.model
      .find({ role: UserRoleEnum.CLIENT })
      .sort({ createdAt: -1 });
  }

  findAllWorker() {
    // const pass = this.configService.get<string>('PASSWORD');

    return this.model.aggregate([
      {
        $match: {
          role: UserRoleEnum.WORKER,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);
  }

  findAllLeader() {
    return this.model.aggregate([
      {
        $match: {
          role: UserRoleEnum.LEADER,
        },
      },
    ]);
  }

  findByUsername(username: string) {
    return this.model.findOne({ username }).select('+password').lean();
  }

  findByEmail(email: string) {
    return this.model.findOne({ email }).select('+password').lean();
  }

  findByPhone(mobile: string) {
    return this.model.findOne({ mobile }).select('+password').lean();
  }

  findByCccd(cccd: string) {
    return this.model.findOne({ cccd }).lean();
  }

  async workerNoAssign() {
    return await this.model.aggregate([
      {
        $match: {
          role: UserRoleEnum.WORKER,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $lookup: {
          from: 'joinprojects',
          localField: '_id',
          foreignField: 'joinor',
          as: 'joinprojectEX',
        },
      },
      {
        $addFields: {
          size: {
            $size: '$joinprojectEX',
          },
        },
      },
      {
        $match: {
          size: 0,
        },
      },
    ]);
  }

  async workerProjectByClient(queryWorkerProject: QueryWorkerProject) {
    const data = await this.model.aggregate([
      {
        $lookup: {
          from: 'workerprojects',
          localField: '_id',
          foreignField: 'worker',
          pipeline: [
            {
              $sort: {
                join: -1,
              },
            },
            {
              $lookup: {
                from: 'projects',
                localField: 'project',
                foreignField: '_id',
                as: 'projectEX',
              },
            },
            {
              $unwind: '$projectEX',
            },
            {
              $lookup: {
                from: 'users',
                localField: 'projectEX.client',
                foreignField: '_id',
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ['$_id', { $toObjectId: queryWorkerProject.id }],
                      },
                    },
                  },
                ],
                as: 'clientEX',
              },
            },
            {
              $unwind: '$clientEX',
            },
          ],
          as: 'workerprojectEX',
        },
      },
      {
        $unwind: '$workerprojectEX',
      },
      {
        $project: {
          name: '$name',
          project: '$workerprojectEX.projectEX.name',
          joindate: '$workerprojectEX.join',
        },
      },
    ]);

    return data;
  }

  async findAllWorkerByClient(id: string) {
    return await this.model.aggregate([
      {
        $match: {
          $expr: {
            $eq: ['$_id', { $toObjectId: id }],
          },
        },
      },
      {
        $lookup: {
          from: 'joinprojects',
          localField: '_id',
          foreignField: 'joinor',
          as: 'joinproject',
        },
      },
      {
        $unwind: '$joinproject',
      },
      {
        $group: {
          _id: {
            _id: '$_id',
            project: '$joinproject.project',
          },
        },
      },
      {
        $project: {
          _id: '$_id._id',
          project: '$_id.project',
        },
      },
      {
        $lookup: {
          from: 'projects',
          localField: 'project',
          foreignField: '_id',
          as: 'project',
        },
      },
      {
        $unwind: '$project',
      },
      {
        $lookup: {
          from: 'joinprojects',
          localField: 'project._id',
          foreignField: 'project',
          pipeline: [
            {
              $match: {
                role: UserRoleEnum.WORKER,
              },
            },
            {
              $lookup: {
                from: 'users',
                localField: 'joinor',
                foreignField: '_id',
                as: 'workers',
              },
            },
            {
              $unwind: '$workers',
            },
          ],
          as: 'joinprojected',
        },
      },
      {
        $unwind: {
          path: '$joinprojected',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: '$joinprojected.workers._id',
          email: '$joinprojected.workers.email',
          name: '$joinprojected.workers.name',
          mobile: '$joinprojected.workers.mobile',
          cccd: '$joinprojected.workers.cccd',
          date: '$joinprojected.workers.date',
          field: '$joinprojected.workers.field',
          avatar: '$joinprojected.workers.avatar',
          status: '$joinprojected.workers.status',
        },
      },
    ]);
  }

  async userAttendance(query: QueryUserAttendanceDto) {
    const { page, limit, project, dateStringify } = query;

    const dateInMonth = JSON.parse(dateStringify).sort((a, b) => a - b);
    const dateInMonthAttendance = dateInMonth?.map((item) => ({
      date: item,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      timeinShifts: 0,
      timeoutShifts: 0,
      workhourOvertime: 0,
    }));

    const rule = await this.rulesService.findOneRefProject(project);

    if (!rule) {
      throw new HttpException(
        `Bạn chưa cài đặt Wifi chấm công !`,
        HttpStatus.BAD_GATEWAY,
      );
    }

    //  lunch break
    const lunch: number =
      rule?.lunchIn - rule?.lunchOut > 0 ? rule?.lunchIn - rule?.lunchOut : 0;

    const hourRules: number =
      rule?.lunchIn - rule?.lunchOut > 0
        ? rule?.timeOut - rule?.timeIn - (rule?.lunchIn - rule?.lunchOut)
        : rule?.timeOut - rule?.timeIn;

    const pipeline: any = [
      {
        $match: {
          role: UserRoleEnum.WORKER,
        },
      },
      {
        $lookup: {
          from: 'attendances',
          localField: '_id',
          foreignField: 'user',
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$project', { $toObjectId: project }],
                },
              },
            },
            {
              $match: {
                month: new Date().getMonth() + 1,
              },
            },
            {
              $lookup: {
                from: 'overtimes',
                localField: '_id',
                foreignField: 'attendance',
                pipeline: [
                  {
                    $project: {
                      _id: 0,
                      type: '$type',
                      workhour: {
                        $cond: {
                          if: {
                            $and: [
                              {
                                $lt: ['$timein', rule?.lunchOut],
                              },
                              {
                                $gt: ['$timeout', rule?.lunchIn],
                              },
                            ],
                          },
                          then: {
                            $subtract: [
                              { $subtract: ['$timeout', '$timein'] },
                              lunch,
                            ],
                          },
                          else: { $subtract: ['$timeout', '$timein'] },
                        },
                      },
                    },
                  },
                ],
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
              $project: {
                _id: 0,
                adjustedGrades: {
                  $map: {
                    input: dateInMonthAttendance,
                    as: 'item',
                    in: {
                      $cond: {
                        if: {
                          $and: [
                            {
                              $eq: ['$$item.year', '$year'],
                            },
                            {
                              $eq: ['$$item.month', '$month'],
                            },
                            {
                              $eq: ['$$item.date', '$date'],
                            },
                          ],
                        },
                        then: {
                          date: '$date',
                          month: '$month',
                          year: '$year',
                          timeinShifts: '$timeinShifts',
                          timeoutShifts: '$timeoutShifts',
                          workHour: '$workHour',
                          workhourOvertime: '$overtime.workhour',
                          type: '$overtime.type',
                        },
                        else: '$$item',
                      },
                    },
                  },
                },
              },
            },
            {
              $unwind: {
                path: '$adjustedGrades',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $group: {
                _id: {
                  date: '$adjustedGrades.date',
                  month: '$adjustedGrades.month',
                  year: '$adjustedGrades.year',
                },
                workhour: {
                  // $sum: {
                  //   $cond: {
                  //     if: {
                  //       $and: [
                  //         {
                  //           $lt: [
                  //             '$adjustedGrades.timeinShifts',
                  //             rule.lunchOut,
                  //           ],
                  //         },
                  //         {
                  //           $gt: [
                  //             '$adjustedGrades.timeoutShifts',
                  //             rule.lunchIn,
                  //           ],
                  //         },
                  //       ],
                  //     },
                  //     then: {
                  //       $subtract: [
                  //         {
                  //           $subtract: [
                  //             '$adjustedGrades.timeoutShifts',
                  //             '$adjustedGrades.timeinShifts',
                  //           ],
                  //         },
                  //         lunch,
                  //       ],
                  //     },
                  //     else: {
                  //       $subtract: [
                  //         '$adjustedGrades.timeoutShifts',
                  //         '$adjustedGrades.timeinShifts',
                  //       ],
                  //     },
                  //   },
                  // },
                  $sum: '$adjustedGrades.workHour',
                },
                workhourObligatory: {
                  $sum: '$adjustedGrades.workhourOvertime',
                },
                types: {
                  $push: '$adjustedGrades.type',
                },
              },
            },
            {
              $project: {
                _id: 0,
                date: '$_id.date',
                month: '$_id.month',
                year: '$_id.year',
                workhour: '$workhour',
                workhourObligatory: '$workhourObligatory',
                type: {
                  $filter: {
                    input: '$types',
                    as: 'item',
                    cond: {
                      $and: [
                        {
                          $gte: ['$$item', OvertimeTypeEnum.SHIFTS],
                        },
                      ],
                    },
                  },
                },
              },
            },
            {
              $unwind: {
                path: '$type',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                date: '$date',
                month: '$month',
                year: '$year',
                workhour: '$workhour',
                workhourObligatory: {
                  $cond: {
                    if: {
                      $and: [
                        { $ne: ['$type', OvertimeTypeEnum.SHIFTS] },
                        { $ne: ['$workhour', 0] },
                      ],
                    },
                    then: {
                      $add: ['$workhourObligatory', hourRules],
                    },
                    else: '$workhourObligatory',
                  },
                },
              },
            },
            {
              $project: {
                date: '$date',
                month: '$month',
                year: '$year',
                workhour: '$workhour',
                workhourObligatory: '$workhourObligatory',
                status: {
                  $cond: {
                    if: { $gte: ['$workhour', '$workhourObligatory'] },
                    then: true,
                    else: false,
                  },
                },
              },
            },
            {
              $group: {
                _id: {
                  date: '$date',
                  month: '$month',
                  year: '$year',
                  workhour: '$workhour',
                  workhourObligatory: '$workhourObligatory',
                  status: '$status',
                },
              },
            },
            {
              $project: {
                _id: 0,
                date: '$_id.date',
                month: '$_id.month',
                year: '$_id.year',
                workhour: '$_id.workhour',
                workhourObligatory: '$_id.workhourObligatory',
                status: '$_id.status',
              },
            },
            {
              $sort: {
                date: 1,
              },
            },
          ],
          as: 'attendance',
        },
      },
      {
        $lookup: {
          from: 'joinprojects',
          localField: '_id',
          foreignField: 'joinor',
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$project', { $toObjectId: query.project }],
                },
              },
            },
          ],
          as: 'joinproject',
        },
      },
      {
        $unwind: '$joinproject',
      },
      {
        $project: {
          _id: '$_id',
          name: '$name',
          attendance: '$attendance',
        },
      },
    ];

    let findQuery = this.model.aggregate(pipeline);

    if (page && limit) {
      findQuery = findQuery.limit(limit * page).skip((page - 1) * limit);
    }

    const [data, count] = await Promise.all([
      findQuery,
      (await this.model.aggregate(pipeline)).length,
    ]);

    return {
      items: data,
      paginate: {
        count: count || 0,
        limit: limit,
        page: page,
      },
    };
  }

  async sumWorkHourInMonth(queryUserAttendanceDto: QueryUserAttendanceDto) {
    const rule = await this.rulesService.findOneRefProject(
      queryUserAttendanceDto.project,
    );

    //  lunch break
    const lunch: number =
      rule?.lunchIn - rule?.lunchOut > 0 ? rule?.lunchIn - rule?.lunchOut : 0;

    const hourRules: number =
      rule?.lunchIn - rule?.lunchOut > 0
        ? rule?.timeOut - rule?.timeIn - (rule?.lunchIn - rule?.lunchOut)
        : rule?.timeOut - rule?.timeIn;

    const query = await this.model.aggregate([
      {
        $match: {
          role: UserRoleEnum.WORKER,
        },
      },
      {
        $lookup: {
          from: 'joinprojects',
          localField: '_id',
          foreignField: 'joinor',
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [
                    '$project',
                    { $toObjectId: queryUserAttendanceDto.project },
                  ],
                },
              },
            },
          ],
          as: 'joinproject',
        },
      },
      {
        $unwind: '$joinproject',
      },
      // --------------------------- calculation ------------------------
      {
        $lookup: {
          from: 'attendances',
          localField: '_id',
          foreignField: 'user',
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$year', +queryUserAttendanceDto.year] },
                    { $eq: ['$month', +queryUserAttendanceDto.month] },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: 'overtimes',
                localField: '_id',
                foreignField: 'attendance',
                pipeline: [
                  {
                    $project: {
                      _id: 0,
                      type: '$type',
                      workhourOvertime: {
                        $cond: {
                          if: {
                            $and: [
                              {
                                $lt: ['$timein', rule?.lunchOut],
                              },
                              {
                                $gt: ['$timeout', rule?.lunchIn],
                              },
                            ],
                          },
                          then: {
                            $subtract: [
                              { $subtract: ['$timeout', '$timein'] },
                              lunch,
                            ],
                          },
                          else: { $subtract: ['$timeout', '$timein'] },
                        },
                      },
                    },
                  },
                ],
                as: 'overtime',
              },
            },
            {
              $project: {
                workhour: {
                  $cond: {
                    if: {
                      $and: [
                        {
                          $lt: ['$timeinShifts', rule?.lunchOut],
                        },
                        {
                          $gt: ['$timeoutShifts', rule?.lunchIn],
                        },
                      ],
                    },
                    then: {
                      $subtract: [
                        {
                          $subtract: ['$timeoutShifts', '$timeinShifts'],
                        },
                        lunch,
                      ],
                    },
                    else: {
                      $subtract: ['$timeoutShifts', '$timeinShifts'],
                    },
                  },
                },
                overtime: '$overtime',
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
                _id: 0,
                workhour: {
                  $sum: {
                    $cond: {
                      if: { $gt: ['$workhour', 0] },
                      then: '$workhour',
                      else: '$$REMOVE',
                    },
                  },
                },
                workhourOvertime: {
                  $push: '$overtime',
                },
              },
            },
          ],
          as: 'attendances',
        },
      },
      // TODO: custom frontend -> can use path: '$attendances' to optimize performance
      {
        $unwind: {
          path: '$attendances',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          workhourInMonth: '$attendances.workhour',
          shifts: {
            $filter: {
              input: '$attendances.workhourOvertime',
              as: 'item',
              cond: { $eq: ['$$item.type', OvertimeTypeEnum.SHIFTS] },
            },
          },
          overtimeMorning: {
            $filter: {
              input: '$attendances.workhourOvertime',
              as: 'item',
              cond: { $eq: ['$$item.type', OvertimeTypeEnum.MORNING] },
            },
          },
          overtimeEverming: {
            $filter: {
              input: '$attendances.workhourOvertime',
              as: 'item',
              cond: { $eq: ['$$item.type', OvertimeTypeEnum.EVERNINGS] },
            },
          },
        },
      },
      {
        $project: {
          workhourInMonth: '$workhourInMonth',
          ratioWork: {
            $round: [{ $divide: ['$workhourInMonth', hourRules] }, 1],
          },
          totalShifts: {
            $reduce: {
              input: '$shifts',
              initialValue: 0,
              in: { $add: ['$$value', '$$this.workhourOvertime'] },
            },
          },
          totalOvertimeMorning: {
            $reduce: {
              input: '$overtimeMorning',
              initialValue: 0,
              in: { $add: ['$$value', '$$this.workhourOvertime'] },
            },
          },
          totalOvertimeEverming: {
            $reduce: {
              input: '$overtimeEverming',
              initialValue: 0,
              in: { $add: ['$$value', '$$this.workhourOvertime'] },
            },
          },
        },
      },
    ]);

    return query;
  }

  async userSalary(queryUserSalaryDto: QueryUserSalaryDto) {
    let query: any = [
      {
        $match: {
          role: UserRoleEnum.WORKER,
        },
      },
      {
        $lookup: {
          from: 'joinprojects',
          localField: '_id',
          foreignField: 'joinor',
          as: 'joinprojects',
        },
      },
      {
        $unwind: '$joinprojects',
      },
      {
        $lookup: {
          from: 'projects',
          localField: 'joinprojects.project',
          foreignField: '_id',
          as: 'projectEX',
        },
      },
      {
        $unwind: '$projectEX',
      },
      {
        $lookup: {
          from: 'payslips',
          localField: 'projectEX.payslip',
          foreignField: '_id',
          pipeline: [
            {
              $project: {
                name: '$name',
              },
            },
          ],
          as: 'payslipEX',
        },
      },
      {
        $unwind: '$payslipEX',
      },
      {
        $lookup: {
          from: 'salaries',
          localField: 'projectEX._id',
          foreignField: 'project',
          pipeline: [
            {
              $project: {
                beneficiary: '$beneficiary',
              },
            },
          ],
          as: 'salarys',
        },
      },
      {
        $lookup: {
          from: 'contracts',
          localField: '_id',
          foreignField: 'user',
          as: 'contract',
        },
      },
      {
        $unwind: {
          path: '$contract',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'salaries',
          localField: 'contract.salary',
          foreignField: '_id',
          as: 'salary',
        },
      },
      {
        $unwind: {
          path: '$salary',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'joinprojects',
          localField: 'projectEX._id',
          foreignField: 'project',
          as: 'joinproject',
        },
      },
      {
        $unwind: {
          path: '$joinproject',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: {
            _id: '$_id',
            name: '$name',
            field: '$field',
            avatar: '$avatar',
            projectId: '$projectEX._id',
            projectName: '$projectEX.name',
            salarys: '$salarys',
            salary: '$salary',
            payslip: '$payslipEX',
            contract: '$contract._id',
            joinprojectId: '$joinprojects._id',
            premiumsInsurance: '$joinprojects.premiumsInsurance',
          },
        },
      },
      {
        $project: {
          _id: '$_id._id',
          name: '$_id.name',
          field: '$_id.field',
          avatar: '$_id.avatar',
          projectId: '$_id.projectId',
          projectName: '$_id.projectName',
          salarys: '$_id.salarys',
          salary: '$_id.salary',
          payslip: '$_id.payslip',
          contract: '$_id.contract',
          joinprojectId: '$_id.joinprojectId',
          premiumsInsurance: '$_id.premiumsInsurance',
        },
      },
      {
        $sort: {
          _id: -1,
        },
      },
    ];

    if (queryUserSalaryDto.name) {
      query = [
        ...query,
        {
          $match: {
            name: {
              $regex: '.*' + queryUserSalaryDto.name + '.*',
              $options: 'i',
            },
          },
        },
      ];
    }

    if (queryUserSalaryDto.userId) {
      query.splice(14, 0, {
        $match: {
          $expr: {
            $eq: [
              '$joinproject.joinor',
              { $toObjectId: queryUserSalaryDto.userId },
            ],
          },
        },
      });
    }

    return await this.model.aggregate(query);
  }

  async userPayroll(queryUserPayrollDto: QueryUserPayrollDto) {
    const { user, project, payslip, salary, month } = queryUserPayrollDto;

    const rules = await this.rulesService.findOneRefProject(project);

    const hour =
      rules?.lunchIn - rules?.lunchOut > 0
        ? rules?.timeOut - rules?.timeIn - (rules?.lunchIn - rules?.lunchOut)
        : rules?.lunchOut - rules?.lunchIn;

    const query = await this.model.aggregate([
      {
        $match: {
          $expr: {
            $eq: ['$_id', { $toObjectId: user }],
          },
        },
      },
      {
        $lookup: {
          from: 'attendances',
          localField: '_id',
          foreignField: 'user',
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$month', +month],
                },
              },
            },
            {
              $match: {
                $expr: {
                  $eq: ['$project', { $toObjectId: project }],
                },
              },
            },
            {
              $lookup: {
                from: 'overtimes',
                localField: '_id',
                foreignField: 'attendance',
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ['$month', +month],
                      },
                    },
                  },
                ],
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
                _id: 0,
                totalHourOvertime: {
                  $sum: {
                    $cond: {
                      if: {
                        $or: [
                          {
                            $eq: ['$overtime.type', OvertimeTypeEnum.EVERNINGS],
                          },
                          {
                            $eq: ['$overtime.type', OvertimeTypeEnum.MORNING],
                          },
                        ],
                      },
                      then: '$workHour',
                      else: 0,
                    },
                  },
                },
                totalHourMain: {
                  $sum: {
                    $cond: {
                      if: {
                        $or: [
                          {
                            $ne: ['$overtime.type', OvertimeTypeEnum.EVERNINGS],
                          },
                          {
                            $ne: ['$overtime.type', OvertimeTypeEnum.MORNING],
                          },
                        ],
                      },
                      then: '$workHour',
                      else: 0,
                    },
                  },
                },
              },
            },
          ],
          as: 'attendance',
        },
      },
      {
        $unwind: {
          path: '$attendance',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'salaries',
          let: { salaryId: salary },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', { $toObjectId: '$$salaryId' }],
                },
              },
            },
          ],
          as: 'salary',
        },
      },
      {
        $unwind: '$salary',
      },
      {
        $lookup: {
          from: 'payslips',
          let: { payslipId: payslip },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', { $toObjectId: '$$payslipId' }],
                },
              },
            },
          ],
          as: 'payslip',
        },
      },
      {
        $unwind: '$payslip',
      },
      // additional join project
      {
        $lookup: {
          from: 'joinprojects',
          localField: '_id',
          foreignField: 'joinor',
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$project', { $toObjectId: project }],
                },
              },
            },
          ],
          as: 'joinproject',
        },
      },
      {
        $unwind: {
          path: '$joinproject',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          name: '$name',
          email: '$email',
          field: '$field',
          salary: '$salary',
          salary_paid_social: '$payslip.salary_paid_social',
          joinprojectId: '$joinproject._id',
          premiumsInsurance: '$joinproject.premiumsInsurance',
          workOvertime: {
            // calculation work day
            $divide: [
              {
                $multiply: [
                  '$attendance.totalHourOvertime',
                  { $divide: ['$payslip.overtime', 100] },
                ],
              },
              hour,
            ],
          },
          workMain: {
            $divide: ['$attendance.totalHourMain', hour],
          },
          allowance: {
            $cond: {
              if: { $gte: ['$attendance.totalHourMain', 30 * hour] },
              then: {
                $add: [
                  '$salary.go',
                  '$salary.home',
                  '$salary.toxic',
                  '$salary.eat',
                  '$salary.diligence',
                ],
              },
              else: {
                $add: [
                  '$salary.go',
                  '$salary.home',
                  '$salary.toxic',
                  '$salary.eat',
                ],
              },
            },
          },
          precent_insurance: {
            $add: [
              '$payslip.society',
              '$payslip.medican',
              '$payslip.unemployment',
              '$payslip.union',
            ],
          },
          insurance: {
            // society * insurance %
            $multiply: [
              '$payslip.salary_paid_social',
              {
                $divide: [
                  {
                    $add: [
                      '$payslip.society',
                      '$payslip.medican',
                      '$payslip.unemployment',
                      '$payslip.union',
                    ],
                  },
                  100,
                ],
              },
            ],
          },
        },
      },
      {
        $project: {
          name: '$name',
          email: '$email',
          field: '$field',
          workOvertime: '$workOvertime',
          joinprojectId: '$joinprojectId',
          premiumsInsurance: '$premiumsInsurance',
          workMain: '$workMain',
          allowance: '$allowance',
          salary: '$salary.salary',
          precent_insurance: '$precent_insurance',
          salary_paid_social: '$salary_paid_social',
          insurance: '$insurance',
          deduct: {
            $add: ['$insurance'],
          },
          moneyOvertime: {
            $multiply: ['$workOvertime', '$salary.salary'],
          },
          moneyMain: {
            $multiply: ['$workMain', '$salary.salary'],
          },
          income: {
            $add: [
              { $multiply: ['$workOvertime', '$salary.salary'] },
              { $multiply: ['$workMain', '$salary.salary'] },
              '$allowance',
            ],
          },
          receive_real: {
            $cond: {
              if: {
                $eq: ['$premiumsInsurance', true],
              },
              then: {
                $subtract: [
                  {
                    $add: [
                      { $multiply: ['$workOvertime', '$salary.salary'] },
                      { $multiply: ['$workMain', '$salary.salary'] },
                      '$allowance',
                    ],
                  },
                  { $add: ['$insurance'] },
                ],
              },
              else: {
                $add: [
                  { $multiply: ['$workOvertime', '$salary.salary'] },
                  { $multiply: ['$workMain', '$salary.salary'] },
                  '$allowance',
                ],
              },
            },
          },
        },
      },
    ]);

    return query.length > 0 ? query[0] : {};
  }

  async toDayAttendance(queryUserAttendanceDto: QueryUserAttendanceDto) {
    const { year, month, date, project, status } = queryUserAttendanceDto;

    const query: any = [
      {
        $match: {
          role: UserRoleEnum.WORKER,
        },
      },
      {
        $lookup: {
          from: 'joinprojects',
          localField: '_id',
          foreignField: 'joinor',
          as: 'joinproject',
        },
      },
      {
        $unwind: '$joinproject',
      },
      {
        $match: {
          $expr: {
            $eq: ['$joinproject.project', { $toObjectId: project }],
          },
        },
      },
      {
        $lookup: {
          from: 'attendances',
          localField: '_id',
          foreignField: 'user',
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$year', +year] },
                    { $eq: ['$month', +month] },
                    { $eq: ['$date', +date] },
                  ],
                },
              },
            },
          ],
          as: 'attendance',
        },
      },
      {
        $unwind: {
          path: '$attendance',
          preserveNullAndEmptyArrays: true,
        },
      },
      // push
      {
        $group: {
          _id: {
            _id: '$_id',
            name: '$name',
            field: '$field',
            mobile: '$mobile',
          },
        },
      },
      {
        $project: {
          _id: '$_id._id',
          name: '$_id.name',
          field: '$_id.field',
          mobile: '$_id.mobile',
        },
      },
    ];

    if (status === 'true') {
      query.splice(6, 0, {
        $match: {
          $expr: {
            $ne: [{ $type: '$attendance' }, 'missing'],
          },
        },
      });
    } else {
      query.splice(6, 0, {
        $match: {
          $expr: {
            $eq: [{ $type: '$attendance' }, 'missing'],
          },
        },
      });
    }

    const data = await this.model.aggregate(query);

    return data;
  }

  async toDayOvertime(queryUserOvertimeDto: QueryUserOvertimeDto) {
    const { project, year, month, date } = queryUserOvertimeDto;

    const query = await this.model.aggregate([
      {
        $lookup: {
          from: 'overtimes',
          localField: '_id',
          foreignField: 'user',
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$year', +year] },
                    { $eq: ['$month', +month] },
                    { $eq: ['$date', +date] },
                    { $eq: ['$project', { $toObjectId: project }] },
                  ],
                },
              },
            },
            {
              $project: {
                datetime: '$datetime',
                timein: '$timein',
                timeout: '$timeout',
              },
            },
          ],
          as: 'overtime',
        },
      },
      {
        $unwind: '$overtime',
      },
      {
        $project: {
          name: '$name',
          field: '$field',
          mobile: '$mobile',
          overtime: '$overtime',
        },
      },
    ]);

    return query;
  }

  async getIdLinkPayroll(id: string) {
    const query = await this.model.aggregate([
      {
        $match: {
          $expr: {
            $eq: ['$_id', { $toObjectId: id }],
          },
        },
      },
      {
        $lookup: {
          from: 'contracts',
          localField: '_id',
          foreignField: 'user',
          pipeline: [
            {
              $match: {
                status: true,
              },
            },
          ],
          as: 'contract',
        },
      },
      {
        $unwind: {
          path: '$contract',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'salaries',
          localField: 'contract.salary',
          foreignField: '_id',
          as: 'salary',
        },
      },
      {
        $unwind: {
          path: '$salary',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'joinprojects',
          localField: '_id',
          foreignField: 'joinor',
          pipeline: [
            {
              $match: {
                status: true,
              },
            },
          ],
          as: 'joinproject',
        },
      },
      {
        $unwind: {
          path: '$joinproject',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'projects',
          localField: 'joinproject.project',
          foreignField: '_id',
          as: 'project',
        },
      },
      {
        $unwind: {
          path: '$project',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'payslips',
          localField: 'project.payslip',
          foreignField: '_id',
          as: 'payslip',
        },
      },
      {
        $unwind: {
          path: '$payslip',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: '$_id',
          contractId: '$contract._id',
          salaryId: '$salary._id',
          projectId: '$project._id',
          payslipId: '$payslip._id',
        },
      },
    ]);

    return query.length > 0 ? query[0] : {};
  }

  findOne(id: string) {
    return this.model.findById(id).lean();
  }

  create(createUserDto: CreateUserDto) {
    return this.model.create(createUserDto);
  }

  async newEmployees(createEmployeeDto: CreateEmployeeDto) {
    try {
      const emailsake = await this.findByEmail(createEmployeeDto.email);

      if (emailsake)
        throw new HttpException('email already exists', HttpStatus.BAD_REQUEST);

      let password: string = Math.floor(
        (1 + Math.random()) * 10000001,
      ).toString();

      SendEmail(
        createEmployeeDto.email,
        createEmployeeDto.name,
        `Tên đăng nhập: ${createEmployeeDto?.email} hoặc ${createEmployeeDto?.mobile}. Mật khẩu: ${password}`,
      );

      password = await bcrypt.hash(password, 10);

      const created = await this.model.create({
        ...createEmployeeDto,
        password,
      });

      this.logger.log(`created new employees by id ${created?._id}`);

      return created;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async newClient(createClientDto: CreateClientDto) {
    try {
      await this.isModelExist(createClientDto.creator);

      const emailsake = await this.findByEmail(createClientDto.email);

      if (emailsake)
        throw new HttpException('email already exists', HttpStatus.BAD_REQUEST);

      let password: string = Math.floor(
        (1 + Math.random()) * 10000001,
      ).toString();

      SendEmail(
        createClientDto.email,
        createClientDto.name,
        `Tên đăng nhập: ${createClientDto?.email} hoặc ${createClientDto?.mobile}. Mật khẩu: ${password}`,
      );

      password = await bcrypt.hash(password, 10);

      const created = await this.model.create({
        ...createClientDto,
        password,
        role: UserRoleEnum.CLIENT,
      });

      this.logger.log(`created new client by id ${created?._id}`);
      return created;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async validateCreateWorker(createWorkerDto: CreateWorkerDto) {
    if (createWorkerDto.email) {
      const emailsake = await this.findByEmail(createWorkerDto.email);

      if (emailsake)
        throw new HttpException(
          'email đã đăng ký trướt đó!',
          HttpStatus.BAD_REQUEST,
        );
    }

    const cccdsake = await this.findByCccd(createWorkerDto.cccd);

    if (cccdsake)
      throw new HttpException(
        'căn cước công dân đã đăng ký trướt đó!',
        HttpStatus.BAD_REQUEST,
      );

    const phonesake = await this.findByPhone(createWorkerDto.mobile);

    if (phonesake)
      throw new HttpException(
        'số điện thoại đã đăng ký trướt đó!',
        HttpStatus.BAD_REQUEST,
      );

    if (createWorkerDto.password !== createWorkerDto.confirmPasword)
      throw new HttpException(
        'password already exists',
        HttpStatus.BAD_REQUEST,
      );
  }

  async generateCode() {
    const codeBiggest = await this.model
      .find({ role: UserRoleEnum.WORKER })
      .sort({ code: 1 });

    let code = 1;
    if (codeBiggest.length > 0 && codeBiggest) {
      code = +codeBiggest[codeBiggest.length - 1].code + 1;
    }

    return code;
  }

  async newWorker(createWorkerDto: CreateWorkerDto) {
    try {
      // validation
      await this.isModelExist(createWorkerDto.creator);
      await this.validateCreateWorker(createWorkerDto);

      const code = await this.generateCode();

      createWorkerDto.password = await bcrypt.hash(
        createWorkerDto.password,
        10,
      );

      Object.keys(createWorkerDto).map(
        (field) => !createWorkerDto[field] && delete createWorkerDto[field],
      );

      const created = await this.model.create({
        ...createWorkerDto,
        role: UserRoleEnum.WORKER,
        code,
      });

      this.logger.log(`created new worker by id#${created?._id}`);

      return created;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async forgotPassword(payload: { email: string }) {
    const { email } = payload;

    try {
      const user = await this.findByEmail(email);

      if (!user)
        throw new HttpException(
          `Email chưa được đăng ký tài khoản!`,
          HttpStatus.BAD_GATEWAY,
        );

      const token = jwt.sign(
        {
          data: email,
        },
        jwtConstant.secret,
        { expiresIn: '24h' },
      );

      const link_page = this.configService.get<string>(
        'LINK_PAGE_RESET_PASSWORD',
      );

      SendEmail(
        email,
        user?.name,
        `Đặt lại mật khẩu. Nhấn vào liên kết: <a href=${
          link_page + `resetpassword?e=` + token
        }>Reset Password</a>`,
      );

      return true;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, password, confirmPassword } = resetPasswordDto;
    try {
      const { data }: any = jwt.verify(token, jwtConstant.secret);

      const user = await this.findByEmail(data);

      if (!user)
        throw new HttpException(
          `Email chưa được đăng ký tài khoản!`,
          HttpStatus.BAD_GATEWAY,
        );

      if (password !== confirmPassword)
        throw new HttpException(`password incorrect!`, HttpStatus.BAD_GATEWAY);

      const pass = await bcrypt.hash(password, 10);

      const updated_password = await this.model.findByIdAndUpdate(
        user?._id,
        { password: pass },
        { new: true },
      );

      this.logger.log(`reset a new password by id#${updated_password?._id}`);

      return updated_password;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async register(registerUserDto: RegisterUserDto) {
    try {
      const emailsake = await this.findByEmail(registerUserDto.email);

      if (emailsake)
        throw new HttpException('email already exists', HttpStatus.BAD_REQUEST);

      registerUserDto.password = await bcrypt.hash(
        registerUserDto.password,
        10,
      );

      const created = await this.model.create({
        ...registerUserDto,
        role: UserRoleEnum.ADMIN,
      });

      this.logger.log(`Register user success`, created?._id);
      return created;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async registerUser(registerUserDto: CreateWorkerDto) {
    try {
      // validate
      await this.validateCreateWorker(registerUserDto);

      const code = await this.generateCode();

      registerUserDto.password = await bcrypt.hash(
        registerUserDto.password,
        10,
      );

      const created = await this.model.create({
        ...registerUserDto,
        role: UserRoleEnum.WORKER,
        code,
      });

      this.logger.log(`Register user success`, created?._id);
      return created;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async updateEmployees(id: string, updateEmployeesDto: UpdateEmployeesDto) {
    try {
      if (updateEmployeesDto.email !== updateEmployeesDto.oldEmail) {
        const emailsake = await this.findByEmail(updateEmployeesDto.email);

        if (emailsake)
          throw new HttpException(
            'email already exists',
            HttpStatus.BAD_REQUEST,
          );
      }

      const updated = await this.model.findByIdAndUpdate(
        id,
        updateEmployeesDto,
        { new: true },
      );

      this.logger.log(`updated employees success by id #${updated?._id}`);

      return updated;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async updateClient(id: string, updateClientDto: UpdateClientDto) {
    try {
      if (updateClientDto.email !== updateClientDto.oldEmail) {
        const emailsake = await this.findByEmail(updateClientDto.email);

        if (emailsake)
          throw new HttpException(
            'email already exists',
            HttpStatus.BAD_REQUEST,
          );
      }

      await this.isModelExist(id);

      const updated = await this.model.findByIdAndUpdate(id, updateClientDto, {
        new: true,
      });

      this.logger.log(`updated client success by id #${updated?._id}`);

      return updated;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async updateWorker(id: string, updateWorkerDto: UpdateWorkerDto) {
    try {
      if (updateWorkerDto.email !== updateWorkerDto.oldEmail) {
        const emailsake = await this.findByEmail(updateWorkerDto.email);

        if (emailsake)
          throw new HttpException(
            'email already exists',
            HttpStatus.BAD_REQUEST,
          );
      }

      await this.isModelExist(id);

      const updated = await this.model.findByIdAndUpdate(id, updateWorkerDto, {
        new: true,
      });

      this.logger.log(`updated worker success by id #${updated?._id}`);

      return updated;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async updateStatus(id: string, updateStatusDto: UpdateStatusDto) {
    try {
      await this.isModelExist(id);

      const updated = await this.model.findByIdAndUpdate(id, updateStatusDto, {
        new: true,
      });

      this.logger.log(`updated status worker by id#${updated?._id}`);

      return updated;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async changePassword(id: string, updatePassword: UpdatePasswordDto) {
    const { oldPassword, password, confirmPassword } = updatePassword;
    try {
      const user = await this.isSelectPassword(id);

      const match = await bcrypt.compare(oldPassword, user.password);

      if (!match)
        throw new HttpException(
          `Mật khẩu cũ không chính xác!`,
          HttpStatus.BAD_GATEWAY,
        );

      if (password !== confirmPassword)
        throw new HttpException(
          `Mật khẩu mới không hợp lệ!`,
          HttpStatus.BAD_GATEWAY,
        );

      const passBcrypt = await bcrypt.hash(password, 10);

      const updated = await this.model.findByIdAndUpdate(
        id,
        { password: passBcrypt },
        { new: true },
      );

      this.logger.log(`updated password success by id#${updated?._id}`);

      return updated;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async remove(id: string) {
    try {
      await this.isModelExist(id);

      const removed = await this.model.findByIdAndDelete(id);

      this.logger.log(`Remove a user by id #${removed?._id}`);

      return removed;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async findMany(ids: string[]) {
    return this.model.find({
      _id: ids,
    });
  }

  async isSelectPassword(id: string) {
    const user = await this.model.findById(id).select('+password');
    if (!user)
      throw new HttpException(`id -> user not found`, HttpStatus.BAD_GATEWAY);

    return user;
  }

  async isModelExist(id, isOptional = false, msg = '') {
    if (isOptional && !id) return;
    const errorMessage = msg || `${User.name} not found`;
    const isExist = await this.findOne(id);
    if (!isExist) throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    return isExist;
  }

  async isModelManyExist(ids, isOptional = false, msg = '') {
    if (isOptional && ids.length === 0) return;
    const errorMessage = msg || `${User.name} not found`;
    const isExist = await this.findMany(ids);
    if (isExist.length !== ids.length)
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    return isExist;
  }
}
