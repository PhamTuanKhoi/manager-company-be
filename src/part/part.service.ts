import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProjectService } from 'src/project/project.service';
import { UserService } from 'src/user/user.service';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';
import { Part, PartDocument } from './schema/part.schema';

@Injectable()
export class PartService {
  private readonly logger = new Logger(Part.name);

  constructor(
    @InjectModel(Part.name) private model: Model<PartDocument>,
    @Inject(forwardRef(() => ProjectService))
    private projectService: ProjectService,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}

  async create(createPartDto: CreatePartDto) {
    try {
      await Promise.all([
        this.projectService.isModelExist(createPartDto.project),
        this.userService.isModelExist(createPartDto.creator),
      ]);

      const created = await this.model.create(createPartDto);

      this.logger.log(`created a new part by id#${created?._id}`);

      return created;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async findByIdProject(id: string) {
    return this.model.aggregate([
      {
        $match: {
          $expr: {
            $eq: ['$project', { $toObjectId: id }],
          },
        },
      },
    ]);
  }
}
