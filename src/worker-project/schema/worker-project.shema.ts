import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Project } from 'src/project/schema/project.schema';
import { User } from 'src/user/schema/user.schema';

export type WorkerProjectDocument = HydratedDocument<WorkerProject>;

@Schema()
export class WorkerProject {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Project.name })
  project: Project;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  worker: User;

  @Prop({ default: Date.now() })
  join: number;
}

export const WorkerProjectSchema = SchemaFactory.createForClass(WorkerProject);
