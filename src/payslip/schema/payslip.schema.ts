import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from 'src/user/schema/user.schema';

export type PayslipDocument = HydratedDocument<Payslip>;

@Schema()
export class Payslip {
  @Prop()
  name: string;
  //Welfare
  @Prop({ default: 0 })
  leave: number;

  @Prop({ default: 0 })
  reward: number;

  @Prop({ default: 0 })
  rice: number;

  @Prop({ default: 0 })
  bonus: number;

  @Prop({ default: 0 })
  overtime: number;

  @Prop({ default: 0 })
  sunday: number;

  @Prop({ default: 0 })
  holiday: number;

  @Prop({ default: 0 })
  service: number;

  //Allowance
  @Prop({ default: 0 })
  go: number;

  @Prop({ default: 0 })
  home: number;

  @Prop({ default: 0 })
  toxic: number;

  @Prop({ default: 0 })
  diligence: number;

  @Prop({ default: 0 })
  effectively: number;

  @Prop({ default: 0 })
  eat: number;

  //Insurance
  @Prop({ default: 0 })
  medican: number;

  @Prop({ default: 0 })
  society: number;

  @Prop({ default: 0 })
  unemployment: number;

  @Prop({ default: 0 })
  union: number;

  @Prop({ default: 0 })
  accident: number;

  @Prop({ default: 0 })
  health: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  creator: User;
}

export const PayslipSchema = SchemaFactory.createForClass(Payslip);
