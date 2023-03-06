import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Project } from 'src/project/schema/project.schema';

export type RuleDocument = HydratedDocument<Rule>;

@Schema()
export class Rule {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => Project })
  project: Project;

  @Prop()
  timeIn: number;

  @Prop()
  timeOut: number;

  @Prop()
  wiffi: string;

  @Prop()
  password: string;

  @Prop({ default: 0 })
  lunchOut: number;

  @Prop({ default: 0 })
  lunchIn: number;

  @Prop()
  workHour: number;
}

export const RuleSchema = SchemaFactory.createForClass(Rule);
