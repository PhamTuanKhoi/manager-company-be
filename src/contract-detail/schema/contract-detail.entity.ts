import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { ContractCategory } from 'src/contract-category/schema/contract-category.schema';
import { User } from 'src/user/schema/user.schema';

export type ContractDetailDocument = HydratedDocument<ContractDetail>;

@Schema({
  timestamps: true,
})
export class ContractDetail {
  @Prop()
  base: string;

  @Prop()
  date: number;

  @Prop()
  rules: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  worker: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  client: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: ContractCategory.name })
  contractCategory: ContractCategory;
}
export const ContractDetailSchema =
  SchemaFactory.createForClass(ContractDetail);
