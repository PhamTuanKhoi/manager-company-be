import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Project } from 'src/project/schema/project.schema';
import { User } from 'src/user/schema/user.schema';

export type SalaryDocument = HydratedDocument<Salary>;

@Schema({
  timestamps: true,
})
export class Salary {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => Project })
  project: Project;

  @Prop()
  beneficiary: string;

  @Prop({ default: 0 })
  salary: number;

  @Prop({ default: 0 })
  go: number;

  @Prop({ default: 0 })
  home: number;

  @Prop({ default: 0 })
  toxic: number;

  @Prop({ default: 0 })
  diligence: number;

  @Prop({ default: 0 })
  eat: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => User })
  creator: User;
}

export const SalarySchema = SchemaFactory.createForClass(Salary);
