import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Project } from 'src/project/schema/project.schema';
import { User } from 'src/user/schema/user.schema';
import { OvertimeTypeEnum } from '../enum/type-overtime.enum';

export type OvertimeDocument = HydratedDocument<Overtime>;

@Schema()
export class Overtime {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => User })
  user: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => Project })
  project: Project;

  @Prop()
  datetime: number;

  @Prop()
  year: number;

  @Prop()
  month: number;

  @Prop()
  date: number;

  @Prop()
  timein: number;

  @Prop()
  timeout: number;

  @Prop({ required: true })
  type: OvertimeTypeEnum;
}

export const OvertimeSchema = SchemaFactory.createForClass(Overtime);
