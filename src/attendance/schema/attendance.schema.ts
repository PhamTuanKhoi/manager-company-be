import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Project } from 'src/project/schema/project.schema';
import { User } from 'src/user/schema/user.schema';

export type AttendanceDocument = HydratedDocument<Attendance>;

@Schema({
  timestamps: true,
})
export class Attendance {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => User })
  user: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => Project })
  project: number;

  @Prop()
  datetime: number;

  @Prop({ default: new Date().getMonth() + 1 })
  month: number;

  @Prop()
  time: number;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);
