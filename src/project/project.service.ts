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

  // findByIdClient(id: string) {
  //   return this.model.aggregate([
  //     {
  //       $lookup: {
  //         from: 'users',
  //         localField: 'client',
  //         foreignField: '_id',
  //         as: 'clientEX',
  //       },
  //     },
  //     {
  //       $unwind: '$clientEX',
  //     },
  //     {
  //       $match: {
  //         $expr: {
  //           $eq: ['$clientEX._id', { $toObjectId: id }],
  //         },
  //       },
  //     },
  //   ]);
  // }

  // async findByIdEmployees(id: string) {
  //   const employees = await this.model.aggregate([
  //     {
  //       $lookup: {
  //         from: 'users',
  //         localField: 'team',
  //         foreignField: '_id',
  //         as: 'employeesEX',
  //       },
  //     },
  //     {
  //       $unwind: '$employeesEX',
  //     },
  //     {
  //       $match: {
  //         $expr: {
  //           $eq: ['$employeesEX._id', { $toObjectId: id }],
  //         },
  //       },
  //     },
  //   ]);

  //   const leader = await this.model.aggregate([
  //     {
  //       $lookup: {
  //         from: 'users',
  //         localField: 'leader',
  //         foreignField: '_id',
  //         as: 'leaderEX',
  //       },
  //     },
  //     {
  //       $unwind: '$leaderEX',
  //     },
  //     {
  //       $match: {
  //         $expr: {
  //           $eq: ['$leaderEX._id', { $toObjectId: id }],
  //         },
  //       },
  //     },
  //   ]);

  //   if (employees && !leader) {
  //     return employees;
  //   }

  //   if (!employees && leader) {
  //     return leader;
  //   }

  //   if (employees && leader) {
  //     return leader.concat(employees);
  //   }

  //   return [];
  // }

  async findByIdWorker(id: string) {
    const data = await this.model.aggregate([
      {
        $lookup: {
          from: 'joinprojects',
          localField: '_id',
          foreignField: 'project',
          as: 'joinproject',
        },
      },
      {
        $unwind: '$joinproject',
      },
      {
        $match: {
          $expr: {
            $eq: ['$joinproject.joinor', { $toObjectId: id }],
          },
        },
      },
    ]);

    return data;
  }

  findByIdAdmin() {
    return this.model.find();
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
            from: 'joinprojects',
            localField: '_id',
            foreignField: 'project',
            pipeline: [
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
            as: 'joinprojectEX',
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
            userEX: '$joinprojectEX.userEX',
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
      //check project
      await this.isModelExist(id);

      let clientApi = updateProjectDto.client.map((i) => {
        return this.userService.findOne(i);
      });

      let teamApi = updateProjectDto.team.map((i) => {
        return this.userService.findOne(i);
      });

      //check client
      const client = await Promise.all(clientApi);

      //check team
      const team = await Promise.all(teamApi);

      //check creator
      await this.userService.isModelExist(updateProjectDto.creator);

      //check leader
      if (updateProjectDto.leader)
        await this.userService.isModelExist(updateProjectDto.leader);

      if (updateProjectDto.client.length !== client.length) {
        throw new HttpException(`client not found`, HttpStatus.BAD_REQUEST);
      }

      if (updateProjectDto.team.length !== team.length) {
        throw new HttpException(`team not found`, HttpStatus.BAD_REQUEST);
      }

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

  async remove(id: string) {
    try {
      await this.isModelExist(id);

      const removed = await this.model.findByIdAndDelete(id);

      this.logger.log(`Delete project by id #${removed?._id}`);

      return removed;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }
}
