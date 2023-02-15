import {
  BadRequestException,
  HttpException,
  HttpStatus,
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

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectModel(User.name) private model: Model<UserDocument>,
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
    const employees = await this.model.aggregate([
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
                localField: 'team',
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
          as: 'projectEX',
        },
      },
      {
        $unwind: '$projectEX',
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
