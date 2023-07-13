import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Project } from 'src/project/schema/project.schema';

export type ContractCategoryDocument = HydratedDocument<ContractCategory>;

@Schema({
  timestamps: true,
})
export class ContractCategory {
  @Prop({ required: true })
  name: string;

  @Prop()
  startDate: number;

  @Prop()
  endDate: number;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Project.name,
    required: true,
  })
  project: Project;
}

export const ContractCategorySchema =
  SchemaFactory.createForClass(ContractCategory);
