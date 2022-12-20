import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ClientProject } from 'src/client-project/entities/client-project.entity';
import { EmployeeDepartmentEnum } from 'src/user/interfaces/department-employess.enum';
import { ProjectPriorityEnum } from '../dto/interfaces/priority-enum';
import * as mongoose from 'mongoose';
import { WorkerProject } from 'src/worker-project/entities/worker-project.entity';
import { ProjectStatusEnum } from '../dto/interfaces/status-enum';
import { User } from 'src/user/schema/user.schema';

export type ProjectDocument = HydratedDocument<Project>;
@Schema({
  timestamps: true,
})
export class Project {
  @Prop()
  name: string;

  @Prop()
  department: EmployeeDepartmentEnum;

  @Prop()
  priority: ProjectPriorityEnum;

  @Prop()
  price: number;

  @Prop()
  start: number;

  @Prop()
  end: number;

  @Prop()
  status: ProjectStatusEnum;

  @Prop()
  content: string;

  @Prop()
  media: string;

  @Prop()
  creator: string;

  //client
  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: User.name }],
  })
  client: User[];

  // employ
  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: User.name }],
  })
  team: User[];
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
