import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Time } from 'src/gobal/schema/time.schema';
import { Overtime } from 'src/overtime/schema/overtime.schema';
import { Project } from 'src/project/schema/project.schema';
import { User } from 'src/user/schema/user.schema';

export type AttendanceDocument = HydratedDocument<Attendance>;

@Schema({
  timestamps: true,
})
export class Attendance extends Time {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => User })
  user: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => Project })
  project: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => Overtime })
  overtime?: Overtime;

  @Prop({ default: 0 })
  workHour?: number;

  @Prop()
  breaks?: number;

  @Prop({ default: 0 })
  timeoutShifts?: number;

  @Prop({ default: 0 })
  timeinShifts?: number;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);
