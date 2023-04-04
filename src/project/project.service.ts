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
import { JoinProjectService } from 'src/join-project/join-project.service';
import { PayslipService } from 'src/payslip/payslip.service';
import { UserRoleEnum } from 'src/user/interfaces/role-user.enum';
import { UserService } from 'src/user/user.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { QueryProjectDto } from './dto/query-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project, ProjectDocument } from './schema/project.schema';

@Injectable()
export class ProjectService {
  private readonly logger = new Logger(ProjectService.name);

  constructor(
    @InjectModel(Project.name) private model: Model<ProjectDocument>,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    @Inject(forwardRef(() => PayslipService))
    private payslipService: PayslipService,
    @Inject(forwardRef(() => JoinProjectService))
    private JoinProjectService: JoinProjectService,
  ) {}

  findAll() {
    return this.model.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'team',
          foreignField: '_id',
          as: 'team',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'creator',
          foreignField: '_id',
          as: 'creator',
        },
      },
      {
        $unwind: '$creator',
      },
      {
        $lookup: {
          from: 'users',
          localField: 'leader',
          foreignField: '_id',
          as: 'leader',
        },
      },
      {
        $unwind: '$leader',
      },
      {
        $lookup: {
          from: 'users',
          localField: 'client',
          foreignField: '_id',
          as: 'client',
        },
      },
      {
        $lookup: {
          from: 'payslips',
          localField: 'payslip',
          foreignField: '_id',
          as: 'payslip',
        },
      },
    ]);
  }

  async findByAllLevel(queryProjectDto: QueryProjectDto) {
    const attendanceToDay = [
      {
        $lookup: {
          from: 'joinprojects',
          localField: '_id',
          foreignField: 'project',
          pipeline: [
            {
              $lookup: {
                from: 'users',
                localField: 'joinor',
                foreignField: '_id',
                pipeline: [
                  {
                    $match: {
                      role: UserRoleEnum.WORKER,
                    },
                  },
                  {
                    $project: {
                      _id: '$_id',
                    },
                  },
                  {
                    $lookup: {
                      from: 'attendances',
                      localField: '_id',
                      foreignField: 'user',
                      as: 'attendance',
                    },
                  },
                  {
                    $unwind: '$attendance',
                  },
                  {
                    $match: {
                      $expr: {
                        $and: [
                          {
                            $eq: ['$attendance.year', new Date().getFullYear()],
                          },
                          {
                            $eq: [
                              '$attendance.month',
                              new Date().getMonth() + 1,
                            ],
                          },
                          {
                            $eq: ['$attendance.date', new Date().getDate()],
                          },
                        ],
                      },
                    },
                  },
                  {
                    $group: {
                      _id: '$attendance.user',
                    },
                  },
                ],
                as: 'userEX',
              },
            },
            {
              $unwind: '$userEX',
            },
          ],
          as: 'joinproject',
        },
      },
    ];

    const lookupEmployees = [
      {
        $lookup: {
          from: 'joinprojects',
          localField: '_id',
          foreignField: 'project',
          pipeline: [
            {
              $match: {
                role: UserRoleEnum.EMPLOYEE,
              },
            },
            {
              $lookup: {
                from: 'users',
                localField: 'joinor',
                pipeline: [
                  {
                    $project: {
                      name: '$name',
                      role: '$role',
                      email: '$email',
                    },
                  },
                ],
                foreignField: '_id',
                as: 'userEX',
              },
            },
            {
              $unwind: {
                path: '$userEX',
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          as: 'joinprojectEmployee',
        },
      },
    ];

    const lookupClient = [
      {
        $lookup: {
          from: 'joinprojects',
          localField: '_id',
          foreignField: 'project',
          pipeline: [
            {
              $lookup: {
                from: 'users',
                localField: 'joinor',
                pipeline: [
                  {
                    $match: {
                      role: UserRoleEnum.CLIENT,
                    },
                  },
                  {
                    $project: {
                      name: '$name',
                      role: '$role',
                      email: '$email',
                    },
                  },
                ],
                foreignField: '_id',
                as: 'userEX',
              },
            },
            {
              $unwind: {
                path: '$userEX',
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          as: 'joinprojectClient',
        },
      },
    ];

    const lookupWorker = [
      {
        $lookup: {
          from: 'joinprojects',
          localField: '_id',
          foreignField: 'project',
          pipeline: [
            {
              $lookup: {
                from: 'users',
                localField: 'joinor',
                pipeline: [
                  {
                    $match: {
                      role: UserRoleEnum.WORKER,
                    },
                  },
                  {
                    $project: {
                      name: '$name',
                      field: '$field',
                      role: '$role',
                      email: '$email',
                    },
                  },
                ],
                foreignField: '_id',
                as: 'userEX',
              },
            },
            {
              $unwind: {
                path: '$userEX',
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          as: 'joinprojectWorker',
        },
      },
    ];

    const overtimeToDay = [
      {
        $lookup: {
          from: 'joinprojects',
          localField: '_id',
          foreignField: 'project',
          pipeline: [
            {
              $lookup: {
                from: 'users',
                localField: 'joinor',
                foreignField: '_id',
                pipeline: [
                  {
                    $match: {
                      role: UserRoleEnum.WORKER,
                    },
                  },
                  {
                    $lookup: {
                      from: 'overtimes',
                      localField: '_id',
                      foreignField: 'user',
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
                    $match: {
                      $expr: {
                        $and: [
                          {
                            $eq: ['$overtime.year', new Date().getFullYear()],
                          },
                          {
                            $eq: ['$overtime.month', new Date().getMonth() + 1],
                          },
                          {
                            $eq: ['$overtime.date', new Date().getDate()],
                          },
                        ],
                      },
                    },
                  },
                  {
                    $group: {
                      _id: '$overtime.user',
                    },
                  },
                ],
                as: 'userEX',
              },
            },
            {
              $unwind: '$userEX',
            },
          ],
          as: 'joinprojectOvertime',
        },
      },
    ];

    const lookupLeader = [
      {
        $lookup: {
          from: 'joinprojects',
          localField: '_id',
          foreignField: 'project',
          pipeline: [
            {
              $match: {
                role: UserRoleEnum.LEADER,
              },
            },
            {
              $lookup: {
                from: 'users',
                localField: 'joinor',
                foreignField: '_id',
                pipeline: [
                  {
                    $project: {
                      name: '$name',
                      field: '$field',
                      role: '$role',
                      email: '$email',
                    },
                  },
                ],
                as: 'userEX',
              },
            },
            {
              $unwind: {
                path: '$userEX',
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          as: 'joinprojectLeader',
        },
      },
      {
        $unwind: '$joinprojectLeader',
      },
    ];

    let query: any = [
      {
        $match: {
          deleted: false,
        },
      },
      // ---------------------------- lookup worker ----------------------------
      ...lookupWorker,
      // ---------------------------- lookup worker ----------------------------
      // ---------------------------- lookup client ----------------------------
      ...lookupClient,
      // ---------------------------- lookup client ----------------------------
      // ---------------------------- lookup employees ----------------------------
      ...lookupEmployees,
      // ---------------------------- lookup employees ----------------------------
      // ---------------------------- lookup leader ----------------------------
      ...lookupLeader,
      // ---------------------------- lookup leader ----------------------------
      // ---------------------------- lookup attendance to day ----------------------------
      ...attendanceToDay,
      // ---------------------------- lookup attendance to day ----------------------------
      // ---------------------------- lookup overtime to day ----------------------------
      ...overtimeToDay,
      // ---------------------------- lookup overtime to day ----------------------------
      {
        $lookup: {
          from: 'payslips',
          localField: 'payslip',
          foreignField: '_id',
          as: 'payslipEX',
        },
      },
      {
        $project: {
          name: '$name',
          priority: '$priority',
          price: '$price',
          start: '$start',
          end: '$end',
          status: '$status',
          content: '$content',
          paylip: '$paylip',
          payslipEX: '$payslipEX',
          workers: '$joinprojectWorker.userEX',
          clients: '$joinprojectClient.userEX',
          employees: '$joinprojectEmployee.userEX',
          leader: '$joinprojectLeader.userEX',
          attendanceToDay: {
            $size: '$joinproject.userEX',
          },
          overtimeToDay: {
            $size: '$joinprojectOvertime',
          },
        },
      },
    ];

    if (queryProjectDto.userId) {
      query = [
        {
          $lookup: {
            from: 'joinprojects',
            localField: '_id',
            foreignField: 'project',
            as: 'joinprojectEX',
          },
        },
        {
          $unwind: '$joinprojectEX',
        },
        {
          $match: {
            $expr: {
              $eq: [
                '$joinprojectEX.joinor',
                { $toObjectId: queryProjectDto.userId },
              ],
            },
          },
        },
        ...query,
      ];
    }

    return await this.model.aggregate(query);
  }

  findById(id: string) {
    try {
      return this.model.aggregate([
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
            foreignField: 'project',
            pipeline: [
              {
                $lookup: {
                  from: 'users',
                  localField: 'joinor',
                  pipeline: [
                    {
                      $match: {
                        role: UserRoleEnum.WORKER,
                      },
                    },
                  ],
                  foreignField: '_id',
                  as: 'userEX',
                },
              },
              {
                $unwind: '$userEX',
              },
            ],
            as: 'joinprojectWorker',
          },
        },
        {
          $lookup: {
            from: 'joinprojects',
            localField: '_id',
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
                  as: 'userEX',
                },
              },
              {
                $unwind: '$userEX',
              },
            ],
            as: 'joinprojectClient',
          },
        },
        {
          $lookup: {
            from: 'joinprojects',
            localField: '_id',
            foreignField: 'project',
            pipeline: [
              {
                $match: {
                  role: UserRoleEnum.EMPLOYEE,
                },
              },
              {
                $lookup: {
                  from: 'users',
                  localField: 'joinor',
                  foreignField: '_id',
                  as: 'userEX',
                },
              },
              {
                $unwind: '$userEX',
              },
            ],
            as: 'joinprojectEmployee',
          },
        },
        {
          $lookup: {
            from: 'joinprojects',
            localField: '_id',
            foreignField: 'project',
            pipeline: [
              {
                $match: {
                  role: UserRoleEnum.LEADER,
                },
              },
              {
                $lookup: {
                  from: 'users',
                  localField: 'joinor',
                  foreignField: '_id',
                  as: 'userEX',
                },
              },
              {
                $unwind: '$userEX',
              },
            ],
            as: 'joinprojectleader',
          },
        },
        {
          $unwind: {
            path: '$joinprojectleader',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'payslips',
            localField: 'payslip',
            foreignField: '_id',
            as: 'payslipEX',
          },
        },
        {
          $project: {
            name: '$name',
            priority: '$priority',
            price: '$price',
            start: '$start',
            end: '$end',
            status: '$status',
            content: '$content',
            paylip: '$paylip',
            payslipEX: '$payslipEX',
            workers: '$joinprojectWorker.userEX',
            clients: '$joinprojectClient.userEX',
            employees: '$joinprojectEmployee.userEX',
            leader: '$joinprojectleader.userEX',
          },
        },
      ]);
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  findOne(id: string) {
    return this.model.findById(id);
  }

  async isModelExist(id, isOptional = false, msg = '') {
    if (isOptional && !id) return;
    const errorMessage = msg || `id-> ${Project.name} not found`;
    const isExist = await this.findOne(id);
    if (!isExist) throw new Error(errorMessage);
  }

  async create(createProjectDto: CreateProjectDto) {
    try {
      const { client, team, creator, leader } = createProjectDto;
      const clientApi = client.map((i) => {
        return this.userService.isModelExist(i);
      });

      const teamApi = team.map((i) => {
        return this.userService.isModelExist(i);
      });

      // check client, team.
      await Promise.all([
        ...clientApi,
        ...teamApi,
        this.userService.isModelExist(creator),
        this.userService.isModelExist(leader),
      ]);

      // create project
      const created = await this.model.create(createProjectDto);

      if (created) {
        // create client join project
        const clientJoin = client.map((i) =>
          this.JoinProjectService.create({
            joinor: i,
            role: UserRoleEnum.CLIENT,
            project: created?._id.toString(),
          }),
        );

        // create employees join project
        const teamJoin = team.map((i) =>
          this.JoinProjectService.create({
            joinor: i,
            role: UserRoleEnum.EMPLOYEE,
            project: created?._id.toString(),
          }),
        );

        // create employees join project
        const leaderJoin = this.JoinProjectService.create({
          joinor: leader,
          role: UserRoleEnum.LEADER,
          project: created?._id.toString(),
        });

        await Promise.all([...clientJoin, ...teamJoin, leaderJoin]);
      }

      this.logger.log(`created a new project by id #${created?._id}`);

      return created;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async updatePayslip(id: string, updateProjectDto: UpdateProjectDto) {
    try {
      // exit model payslip
      if (updateProjectDto.payslip) {
        await this.payslipService.isModelExist(updateProjectDto.payslip);
      }

      const updatedPayslip = await this.model.findByIdAndUpdate(
        id,
        updateProjectDto,
        { new: true },
      );

      this.logger.log(`updated a payslip by id #${updatedPayslip?._id}`);

      return updatedPayslip;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    try {
      const { team, client, leader, creator } = updateProjectDto;

      // check input data
      await this.validate(id, team, client, leader, creator);
      await this.updateJoinProject(id, team, client, leader);

      const updated = await this.model.findByIdAndUpdate(id, updateProjectDto, {
        new: true,
      });

      this.logger.log(`updated a project by id #${updated?._id}`);

      return updated;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async basket(id: string) {
    try {
      await this.isModelExist(id);

      const removed = await this.model.findByIdAndUpdate(
        id,
        { deleted: true },
        { new: true },
      );

      this.logger.log(`Move project by id #${removed?._id} at basket`);

      return removed;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async updateJoinProject(
    id: string,
    team: string[],
    client: string[],
    leader: string,
  ) {
    try {
      // remove join project by id project and role client, employess and leader
      await Promise.all([
        this.JoinProjectService.deleteSubportUpdateProject(
          id,
          UserRoleEnum.LEADER,
        ),
        this.JoinProjectService.deleteSubportUpdateProject(
          id,
          UserRoleEnum.EMPLOYEE,
        ),
        this.JoinProjectService.deleteSubportUpdateProject(
          id,
          UserRoleEnum.CLIENT,
        ),
      ]);

      // create join project client, employees, leader
      const createJoinProjecRoleClient = client.map((i) => {
        return this.JoinProjectService.create({
          joinor: i,
          project: id,
          role: UserRoleEnum.CLIENT,
        });
      });

      const createJoinProjecRoleEmployees = team.map((i) => {
        return this.JoinProjectService.create({
          joinor: i,
          project: id,
          role: UserRoleEnum.EMPLOYEE,
        });
      });

      const createJoinProjecRoleLeader = this.JoinProjectService.create({
        joinor: leader,
        project: id,
        role: UserRoleEnum.LEADER,
      });

      await Promise.all([
        createJoinProjecRoleLeader,
        ...createJoinProjecRoleClient,
        ...createJoinProjecRoleEmployees,
      ]);

      return true;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async validate(
    id: string,
    team: string[],
    client: string[],
    leader: string,
    creator: string,
  ) {
    try {
      let clientApi = client.map((i) => {
        return this.userService.findOne(i);
      });

      let teamApi = team.map((i) => {
        return this.userService.findOne(i);
      });

      //check project, client, team , creator
      await Promise.all([
        this.isModelExist(id),
        ...clientApi,
        ...teamApi,
        this.userService.isModelExist(creator),
      ]);

      //check leader
      if (leader) await this.userService.isModelExist(leader);

      return true;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }
}
