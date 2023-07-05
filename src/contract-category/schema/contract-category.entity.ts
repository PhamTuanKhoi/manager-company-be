import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Project } from 'src/project/schema/project.schema';

export class ContractCategory {
  @Prop()
  name: string;

  @Prop()
  startDate: number;

  @Prop()
  endDate: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Project.name })
  project: Project;
}
