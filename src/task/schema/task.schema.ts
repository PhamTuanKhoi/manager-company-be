import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Project } from 'src/project/schema/project.schema';
import { User } from 'src/user/schema/user.schema';
import { TaskStatusEnum } from '../interface/task-status.enum';

export type TaskDocument = HydratedDocument<Task>;

@Schema()
export class Task {
  @Prop()
  name: string;

  @Prop()
  content: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Project.name })
  project: Project;

  // @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: User.name }] })
  // user: User[];

  @Prop()
  status: TaskStatusEnum;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
