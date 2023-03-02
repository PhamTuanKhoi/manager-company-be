import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Salary } from 'src/salary/schema/salary.schema';
import { User } from 'src/user/schema/user.schema';

export type ContractDocument = HydratedDocument<Contract>;

@Schema()
export class Contract {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => Salary })
  salary: Salary;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => User })
  user: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => User })
  creator: User;
}

export const ContractSchema = SchemaFactory.createForClass(Contract);
