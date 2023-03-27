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
import { CreateUserDto } from './dto/create-dto/create-user.dto';
import { RegisterUserDto } from './dto/create-dto/register-user.dto';
import { UpdateUserDto } from './dto/update-dto/update-user.dto';
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

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectModel(User.name) private model: Model<UserDocument>,
    @Inject(forwardRef(() => RulesService))
    private readonly rulesService: RulesService,
    private configService: ConfigService,
  ) {}

  async findAllEloyees() {
    return this.model.find({
      $or: [
        {
          role: UserRoleEnum.EMPLOYEE,
        },
        {
          role: UserRoleEnum.LEADER,
        },
      ],
    });
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

  async findAllEloyeesByClient(id: string) {
    const data = await this.model.aggregate([
      {
        $match: {
          role: UserRoleEnum.EMPLOYEE,
        },
      },
      {
        $lookup: {
          from: 'projects',
          localField: '_id',
          foreignField: 'team',
          pipeline: [
            {
              $lookup: {
                from: 'users',
                localField: 'client',
                foreignField: '_id',
                as: 'clientEX',
              },
            },
            {
              $unwind: '$clientEX',
            },
            {
              $match: {
                $expr: {
                  $eq: ['$clientEX._id', { $toObjectId: id }],
                },
              },
            },
          ],
          as: 'projectTeam',
        },
      },
    ]);

    return data.filter((item) => item.projectTeam.length > 0);
  }

  async findAllEloyeesByWorker(id) {
    const data = await this.model.aggregate([
      {
        $match: {
          role: UserRoleEnum.EMPLOYEE,
        },
      },
      {
        $lookup: {
          from: 'projects',
          localField: '_id',
          foreignField: 'team',
          pipeline: [
            {
              $lookup: {
                from: 'workerprojects',
                localField: '_id',
                foreignField: 'project',
                as: 'workerprojectEX',
              },
            },
            {
              $unwind: '$workerprojectEX',
            },
            {
              $match: {
                $expr: {
                  $eq: ['$workerprojectEX.worker', { $toObjectId: id }],
                },
              },
            },
          ],
          as: 'projectEX',
        },
      },
      {
        $unwind: '$projectEX',
      },
    ]);

    return data;
  }

  async findAllClientByEmployees(id: string) {
    console.log(id);

    const employees = await this.model.aggregate([
      {
        $lookup: {
          from: 'joinprojects',
          localField: '_id',
          foreignField: 'joinor',
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$joinor', { $toObjectId: id }],
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
    ]);

    const leader = await this.model.aggregate([
      {
        $match: {
          role: UserRoleEnum.CLIENT,
        },
      },
      {
        $lookup: {
          from: 'projects',
          localField: '_id',
          foreignField: 'client',
          pipeline: [
            {
              $lookup: {
                from: 'users',
                localField: 'leader',
                foreignField: '_id',
                as: 'leaderEX',
              },
            },
            {
              $unwind: '$leaderEX',
            },
            {
              $match: {
                $expr: {
                  $eq: ['$leaderEX._id', { $toObjectId: id }],
                },
              },
            },
          ],
          as: 'projectEX',
        },
      },
      {
        $unwind: '$projectEX',
      },
    ]);

    if (employees && leader) {
      return employees.concat(leader);
    }

    return leader || employees;
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
      {
        $lookup: {
          from: 'workerprojects',
          localField: '_id',
          foreignField: 'worker',
          pipeline: [
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
          ],
          as: 'workerprojectEX',
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

  // async workerProjectByEmployees(queryWorkerProject: QueryWorkerProject) {
  //   const data = await this.model.aggregate([
  //     {
  //       $lookup: {
  //         from: 'workerprojects',
  //         localField: '_id',
  //         foreignField: 'worker',
  //         pipeline: [
  //           {
  //             $sort: {
  //               join: -1,
  //             },
  //           },
  //           {
  //             $lookup: {
  //               from: 'projects',
  //               localField: 'project',
  //               foreignField: '_id',
  //               as: 'projectEX',
  //             },
  //           },
  //           {
  //             $unwind: '$projectEX',
  //           },
  //           {
  //             $lookup: {
  //               from: 'users',
  //               let: { leader: '$projectEX.leader', team: 'projectEX.team' },
  //               pipeline: [
  //                 // {
  //                 //   $match: {
  //                 //     $or: [
  //                 //       {
  //                 //         $expr: {
  //                 //           $eq: ['$_id', '$$leader'],
  //                 //         },
  //                 //       },
  //                 //       {
  //                 //         $expr: {
  //                 //           $eq: ['$_id', '$$team'],
  //                 //         },
  //                 //       },
  //                 //     ],
  //                 //   },
  //                 // },
  //                 // {
  //                 //   $match: {
  //                 //     _id: { $in: '$$team' },
  //                 //   },
  //                 // },
  //               ],
  //               as: 'clientEX',
  //             },
  //           },
  //           {
  //             $unwind: '$clientEX',
  //           },
  //           {
  //             $match: {
  //               $expr: {
  //                 $eq: [
  //                   '$clientEX._id',
  //                   { $toObjectId: queryWorkerProject.id },
  //                 ],
  //               },
  //             },
  //           },
  //         ],
  //         as: 'workerprojectEX',
  //       },
  //     },
  //     {
  //       $unwind: '$workerprojectEX',
  //     },
  //     // {
  //     //   $project: {
  //     //     name: '$name',
  //     //     project: '$workerprojectEX.projectEX.name',
  //     //     joindate: '$workerprojectEX.join',
  //     //   },
  //     // },
  //   ]);

  //   return data;
  // }

  async findAllWorkerByClient(id: string) {
    const data = await this.model.aggregate([
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
          from: 'workerprojects',
          localField: '_id',
          foreignField: 'worker',
          pipeline: [
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
                as: 'clientEX',
              },
            },
            {
              $unwind: '$clientEX',
            },
            {
              $match: {
                $expr: {
                  $eq: ['$clientEX._id', { $toObjectId: id }],
                },
              },
            },
          ],
          as: 'workerprojectEX',
        },
      },
      {
        $unwind: '$workerprojectEX',
      },
    ]);

    return data;
  }

  async findAllWorkerByEmployees(id: string) {
    const employees = await this.model.aggregate([
      {
        $match: {
          role: UserRoleEnum.WORKER,
        },
      },
      {
        $lookup: {
          from: 'workerprojects',
          localField: '_id',
          foreignField: 'worker',
          pipeline: [
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
                localField: 'projectEX.team',
                foreignField: '_id',
                as: 'employeesEX',
              },
            },
            {
              $unwind: '$employeesEX',
            },
            {
              $match: {
                $expr: {
                  $eq: ['$employeesEX._id', { $toObjectId: id }],
                },
              },
            },
          ],
          as: 'workerprojectEX',
        },
      },
      {
        $unwind: '$workerprojectEX',
      },
    ]);

    const leader = await this.model.aggregate([
      {
        $match: {
          role: UserRoleEnum.WORKER,
        },
      },
      {
        $lookup: {
          from: 'workerprojects',
          localField: '_id',
          foreignField: 'worker',
          pipeline: [
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
              $match: {
                $expr: {
                  $eq: ['$projectEX.leader', { $toObjectId: id }],
                },
              },
            },
          ],
          as: 'workerprojectEX',
        },
      },
      {
        $unwind: '$workerprojectEX',
      },
    ]);

    if (employees && leader) {
      return employees.concat(leader);
    }

    return employees || leader;
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

    //  lunch break
    const lunch: number =
      rule?.lunchIn - rule.lunchOut > 0 ? rule?.lunchIn - rule?.lunchOut : 0;

    const hourRules: number =
      rule?.lunchIn - rule.lunchOut > 0
        ? rule.timeOut - rule.timeIn - (rule.lunchIn - rule.lunchOut)
        : rule.timeOut - rule.timeIn;

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
                                $lt: ['$timein', rule.lunchOut],
                              },
                              {
                                $gt: ['$timeout', rule.lunchIn],
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
                  $sum: {
                    $cond: {
                      if: {
                        $and: [
                          {
                            $lt: [
                              '$adjustedGrades.timeinShifts',
                              rule.lunchOut,
                            ],
                          },
                          {
                            $gt: [
                              '$adjustedGrades.timeoutShifts',
                              rule.lunchIn,
                            ],
                          },
                        ],
                      },
                      then: {
                        $subtract: [
                          {
                            $subtract: [
                              '$adjustedGrades.timeoutShifts',
                              '$adjustedGrades.timeinShifts',
                            ],
                          },
                          lunch,
                        ],
                      },
                      else: {
                        $subtract: [
                          '$adjustedGrades.timeoutShifts',
                          '$adjustedGrades.timeinShifts',
                        ],
                      },
                    },
                  },
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
      rule?.lunchIn - rule.lunchOut > 0 ? rule?.lunchIn - rule?.lunchOut : 0;

    const hourRules: number =
      rule?.lunchIn - rule.lunchOut > 0
        ? rule.timeOut - rule.timeIn - (rule.lunchIn - rule.lunchOut)
        : rule.timeOut - rule.timeIn;

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
                                $lt: ['$timein', rule.lunchOut],
                              },
                              {
                                $gt: ['$timeout', rule.lunchIn],
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
                          $lt: ['$timeinShifts', rule.lunchOut],
                        },
                        {
                          $gt: ['$timeoutShifts', rule.lunchIn],
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
        $project: {
          name: '$name',
          field: '$field',
          projectId: '$projectEX._id',
          projectName: '$projectEX.name',
          salarys: '$salarys',
          salary: '$salary',
          payslip: '$payslipEX',
        },
      },
    ]);

    return query;
  }

  async userPayroll(queryUserPayrollDto: QueryUserPayrollDto) {
    const { user, project, payslip, salary } = queryUserPayrollDto;

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
                  $eq: ['$project', { $toObjectId: project }],
                },
              },
            },
          ],
          as: 'attendance',
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
                $expr: {
                  $eq: ['$salary', { $toObjectId: salary }],
                },
              },
            },
          ],
          as: 'contract',
        },
      },
      {
        $unwind: '$contract',
      },
      {
        $lookup: {
          from: 'salaries',
          localField: 'contract.salary',
          foreignField: '_id',
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', { $toObjectId: salary }],
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
          from: 'projects',
          localField: 'salary.project',
          foreignField: '_id',
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', { $toObjectId: project }],
                },
              },
            },
          ],
          as: 'project',
        },
      },
      {
        $unwind: '$project',
      },
      {
        $lookup: {
          from: 'payslips',
          localField: 'project.payslip',
          foreignField: '_id',
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', { $toObjectId: payslip }],
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
    ]);

    return query;
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
        `Mat khau cua ban la : ${password}`,
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
        `Mat khau cua ban la : ${password}`,
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

  async newWorker(createWorkerDto: CreateWorkerDto) {
    try {
      await this.isModelExist(createWorkerDto.creator);

      const emailsake = await this.findByEmail(createWorkerDto.email);

      if (emailsake)
        throw new HttpException('email already exists', HttpStatus.BAD_REQUEST);

      if (createWorkerDto.password !== createWorkerDto.confirmPasword)
        throw new HttpException(
          'password already exists',
          HttpStatus.BAD_REQUEST,
        );

      createWorkerDto.password = await bcrypt.hash(
        createWorkerDto.password,
        10,
      );

      const created = await this.model.create({
        ...createWorkerDto,
        role: UserRoleEnum.WORKER,
      });

      this.logger.log(`created new worker by id#${created?._id}`);

      return created;
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
      const emailsake = await this.findByEmail(registerUserDto.email);

      if (emailsake)
        throw new HttpException('email already exists', HttpStatus.BAD_REQUEST);

      if (registerUserDto.password !== registerUserDto.confirmPasword)
        throw new HttpException('Mật khẩu không đúng', HttpStatus.BAD_REQUEST);

      registerUserDto.password = await bcrypt.hash(
        registerUserDto.password,
        10,
      );

      const created = await this.model.create({
        ...registerUserDto,
        role: UserRoleEnum.WORKER,
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
