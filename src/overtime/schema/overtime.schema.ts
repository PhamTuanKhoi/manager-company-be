import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Attendance } from 'src/attendance/schema/attendance.schema';
import { Project } from 'src/project/schema/project.schema';
import { User } from 'src/user/schema/user.schema';

export type OvertimeDocument = HydratedDocument<Overtime>;

@Schema()
export class Overtime {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => User })
  user: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => Attendance })
  attendance: Attendance;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => Project })
  project: Project;

  @Prop()
  date: number;

  @Prop()
  timein: number;

  @Prop()
  timeout: number;
}

export const OvertimeSchema = SchemaFactory.createForClass(Overtime);
