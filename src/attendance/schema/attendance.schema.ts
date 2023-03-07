import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Overtime } from 'src/overtime/schema/overtime.schema';
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

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => Overtime })
  overtime: Overtime;

  @Prop()
  datetime: number;

  @Prop({ default: new Date().getFullYear() })
  year: number;

  @Prop({ default: new Date().getMonth() + 1 })
  month: number;

  @Prop({ default: new Date().getDate() })
  date: number;

  @Prop({ default: 0 })
  timein: number;

  @Prop({ default: 0 })
  timeout?: number;

  @Prop({ default: 0 })
  workday?: number;

  @Prop({
    type: {
      date: Number,
      timein: Number,
      timeout: Number,
    },
  })
  ovtexport?: {
    date: number;
    timein: number;
    timeout: number;
  };
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);
