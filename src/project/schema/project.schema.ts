import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { EmployeeDepartmentEnum } from 'src/user/interfaces/department-employess.enum';
import { ProjectPriorityEnum } from '../interfaces/priority-enum';
import * as mongoose from 'mongoose';
import { ProjectStatusEnum } from '../interfaces/status-enum';
import { User } from 'src/user/schema/user.schema';
import { Payslip } from 'src/payslip/schema/payslip.schema';

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

  // @Prop()
  // price: number;

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
  address: string;

  // creator
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  creator: User;

  // //client
  // @Prop({
  //   type: [{ type: mongoose.Schema.Types.ObjectId, ref: User.name }],
  // })
  // client: User[];

  // // employ
  // @Prop({
  //   type: [{ type: mongoose.Schema.Types.ObjectId, ref: User.name }],
  // })
  // team: User[];

  // // leader
  // @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  // leader: User;

  // payslip
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Payslip.name })
  payslip: Payslip;

  @Prop({ default: false })
  deleted: boolean;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
