import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from 'src/user/schema/user.schema';

export type PayslipDocument = HydratedDocument<Payslip>;

@Schema()
export class Payslip {
  @Prop()
  name: string;
  //Welfare
  @Prop()
  leave: number;

  @Prop()
  reward: number;

  @Prop()
  rice: number;

  @Prop()
  bonus: number;

  @Prop()
  overtime: number;

  @Prop()
  sunday: number;

  @Prop()
  holiday: number;

  @Prop()
  service: number;

  //Allowance
  @Prop()
  go: number;

  @Prop()
  home: number;

  @Prop()
  toxic: number;

  @Prop()
  diligence: number;

  @Prop()
  effectively: number;

  @Prop()
  eat: number;

  //Insurance
  @Prop()
  medican: number;

  @Prop()
  society: number;

  @Prop()
  unemployment: number;

  @Prop()
  union: number;

  @Prop()
  accident: number;

  @Prop()
  health: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  creator: User;
}

export const PayslipSchema = SchemaFactory.createForClass(Payslip);
