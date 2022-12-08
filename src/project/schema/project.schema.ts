import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ClientProject } from 'src/client-project/entities/client-project.entity';
import { EmployeeDepartmentEnum } from 'src/gobal/department-employess.enum';
import { ProjectPriorityEnum } from '../dto/interfaces/priority-enum';
import * as mongoose from 'mongoose';
import { EmployProject } from 'src/employ-project/entities/employ-project.entity';
import { WorkerProject } from 'src/worker-project/entities/worker-project.entity';
import { ProjectStatusEnum } from '../dto/interfaces/status-enum';

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
  content: [];

  @Prop()
  media: string;

  // //client
  // @Prop({
  //   type: [{ type: mongoose.Schema.Types.ObjectId, ref: ClientProject.name }],
  // })
  // client: ClientProject[];

  // employ
  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: EmployProject.name }],
  })
  team: EmployProject[];

  // // worker
  // @Prop({
  //   type: [{ type: mongoose.Schema.Types.ObjectId, ref: WorkerProject.name }],
  // })
  // worker: WorkerProject[];
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
