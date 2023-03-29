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
  bonus: number;

  @Prop({ default: 0 })
  overtime: number;

  @Prop({ default: 0 })
  sunday: number;

  @Prop({ default: 0 })
  holiday: number;

  @Prop({ default: 0 })
  service: number;

  // salary paid for social
  @Prop({ default: 0 })
  salary_paid_social: number;
  //Insurance
  @Prop({ default: 0 })
  medican: number;

  @Prop({ default: 0 })
  society: number;

  @Prop({ default: 0 })
  unemployment: number;

  @Prop({ default: 0 })
  union: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  creator: User;
}

export const PayslipSchema = SchemaFactory.createForClass(Payslip);
