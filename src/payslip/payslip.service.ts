import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserService } from 'src/user/user.service';
import { CreatePayslipDto } from './dto/create-payslip.dto';
import { QueryPayslipDto } from './dto/query-payslip.dto';
import { UpdatePayslipDto } from './dto/update-payslip.dto';
import { Payslip, PayslipDocument } from './schema/payslip.schema';
@Injectable()
export class PayslipService {
  private readonly logger = new Logger(PayslipService.name);

  constructor(
    @InjectModel(Payslip.name) private model: Model<PayslipDocument>,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}

  list() {
    return this.model.aggregate([
      {
        $lookup: {
          from: 'projects',
          localField: '_id',
          foreignField: 'payslip',
          pipeline: [
            {
              $project: {
                name: '$name',
              },
            },
          ],
          as: 'projectEX',
        },
      },
      {
        $unwind: {
          path: '$projectEX',
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);
  }

  async detail(queryPayslipDto: QueryPayslipDto) {
    const { payslip, project, salary } = queryPayslipDto;
    let query: any = [
      {
        $match: {
          $expr: {
            $eq: ['$_id', { $toObjectId: payslip }],
          },
        },
      },
      {
        $lookup: {
          from: 'projects',
          localField: '_id',
          foreignField: 'payslip',
          pipeline: [
            {
              $project: {
                name: '$name',
              },
            },
          ],
          as: 'project',
        },
      },
    ];

    if (project) {
      query = [
        ...query,
        {
          $unwind: '$project',
        },
        {
          $match: {
            $expr: {
              $eq: ['$project._id', { $toObjectId: project }],
            },
          },
        },
      ];
    }

    if (salary) {
      query = [
        ...query,
        {
          $lookup: {
            from: 'salaries',
            localField: 'project._id',
            foreignField: 'project',
            as: 'salary',
          },
        },
        {
          $unwind: '$salary',
        },
        {
          $match: {
            $expr: {
              $eq: ['$salary._id', { $toObjectId: salary }],
            },
          },
        },
      ];
    }

    return this.model.aggregate(query);
  }

  async create(createPayslipDto: CreatePayslipDto) {
    try {
      await this.userService.isModelExist(createPayslipDto.creator);

      const created = await this.model.create(createPayslipDto);

      this.logger.log(`created new payslip by id #${created._id}`);

      return created;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async isModelExist(id, isOptional = false, msg = '') {
    if (isOptional && !id) return;
    const errorMessage = msg || `id-> ${PayslipService.name} not found`;
    const isExist = await this.findOne(id);
    if (!isExist) throw new Error(errorMessage);
  }

  findOne(id: string) {
    return this.model.findById(id).lean();
  }

  // async findByEmployees(id: string) {
  //   try {
  //     const employees = await this.model.aggregate([
  //       {
  //         $lookup: {
  //           from: 'projects',
  //           localField: '_id',
  //           foreignField: 'payslip',
  //           pipeline: [
  //             {
  //               $lookup: {
  //                 from: 'users',
  //                 localField: 'team',
  //                 foreignField: '_id',
  //                 as: 'employeesEX',
  //               },
  //             },
  //             {
  //               $unwind: '$employeesEX',
  //             },
  //             {
  //               $match: {
  //                 $expr: {
  //                   $eq: ['$employeesEX._id', { $toObjectId: id }],
  //                 },
  //               },
  //             },
  //           ],
  //           as: 'projects',
  //         },
  //       },
  //       {
  //         $unwind: '$projects',
  //       },
  //     ]);

  //     const leader = await this.model.aggregate([
  //       {
  //         $lookup: {
  //           from: 'projects',
  //           localField: '_id',
  //           foreignField: 'payslip',
  //           pipeline: [
  //             {
  //               $lookup: {
  //                 from: 'users',
  //                 localField: 'leader',
  //                 foreignField: '_id',
  //                 as: 'leaderEX',
  //               },
  //             },
  //             {
  //               $unwind: '$leaderEX',
  //             },
  //             {
  //               $match: {
  //                 $expr: {
  //                   $eq: ['$leaderEX._id', { $toObjectId: id }],
  //                 },
  //               },
  //             },
  //           ],
  //           as: 'projects',
  //         },
  //       },
  //       {
  //         $unwind: '$projects',
  //       },
  //     ]);

  //     if (employees && leader) {
  //       return employees.concat(leader);
  //     }

  //     return employees || leader;
  //   } catch (error) {
  //     this.logger.error(error?.message, error.stack);
  //     throw new BadRequestException(error?.message);
  //   }
  // }

  async findByUserId(id: string) {
    try {
      const data = await this.model.aggregate([
        {
          $lookup: {
            from: 'projects',
            localField: '_id',
            foreignField: 'payslip',
            pipeline: [
              {
                $project: {
                  _id: '$_id',
                  name: '$name',
                },
              },
            ],
            as: 'projectEX',
          },
        },
        {
          $unwind: '$projectEX',
        },
        {
          $lookup: {
            from: 'joinprojects',
            localField: 'projectEX._id',
            foreignField: 'project',
            pipeline: [
              {
                $project: {
                  _id: 0,
                  joinor: '$joinor',
                },
              },
            ],
            as: 'joinprojects',
          },
        },
        {
          $unwind: '$joinprojects',
        },
        {
          $match: {
            $expr: {
              $eq: ['$joinprojects.joinor', { $toObjectId: id }],
            },
          },
        },
      ]);
      return data;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  // async findByWorker(id) {
  //   const data = await this.model.aggregate([
  //     {
  //       $lookup: {
  //         from: 'projects',
  //         localField: '_id',
  //         foreignField: 'payslip',
  //         pipeline: [
  //           {
  //             $lookup: {
  //               from: 'workerprojects',
  //               localField: '_id',
  //               foreignField: 'project',
  //               as: 'workerprojectEX',
  //             },
  //           },
  //           {
  //             $unwind: '$workerprojectEX',
  //           },
  //           {
  //             $match: {
  //               $expr: {
  //                 $eq: ['$workerprojectEX.worker', { $toObjectId: id }],
  //               },
  //             },
  //           },
  //         ],
  //         as: 'projectEX',
  //       },
  //     },
  //     {
  //       $unwind: '$projectEX',
  //     },
  //   ]);

  //   return data;
  // }

  findByProject(id: string) {
    return this.model.find();
  }

  findByIdUser(id: string) {
    return this.model.find({ creator: id });
  }

  async update(id: string, updatePayslipDto: UpdatePayslipDto) {
    try {
      await this.isModelExist(id);

      const updated = await this.model.findByIdAndUpdate(id, updatePayslipDto, {
        new: true,
      });

      this.logger.log(`updated a payslip success by id #${updated?._id}`);

      return updated;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async remove(id: string) {
    try {
      const deleted = await this.model.findByIdAndDelete(id);

      this.logger.log(`delete payslip by id #${deleted?._id}`);

      return deleted;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }
}
