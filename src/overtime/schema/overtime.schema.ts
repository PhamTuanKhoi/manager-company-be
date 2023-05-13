import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Attendance } from 'src/attendance/schema/attendance.schema';
import { Time } from 'src/gobal/schema/time.schema';
import { Project } from 'src/project/schema/project.schema';
import { User } from 'src/user/schema/user.schema';
import { OvertimeTypeEnum } from '../enum/type-overtime.enum';

export type OvertimeDocument = HydratedDocument<Overtime>;

@Schema({
  timestamps: true,
})
export class Overtime extends Time {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => User })
  user: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Project.name })
  project: Project;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Attendance' })
  attendance: Attendance;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  creator: User;

  @Prop({ required: true })
  type: OvertimeTypeEnum;
}

export const OvertimeSchema = SchemaFactory.createForClass(Overtime);
