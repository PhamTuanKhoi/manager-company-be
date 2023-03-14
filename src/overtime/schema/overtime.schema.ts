import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
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

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => Project })
  project: Project;

  // @Prop()
  // datetime: number;

  // @Prop({ default: new Date().getFullYear() })
  // year: number;

  // @Prop({ default: new Date().getMonth() + 1 })
  // month: number;

  // @Prop({ default: new Date().getDate() })
  // date: number;

  // @Prop()
  // timein: number;

  // @Prop()
  // timeout: number;

  @Prop({ required: true })
  type: OvertimeTypeEnum;
}

export const OvertimeSchema = SchemaFactory.createForClass(Overtime);
