import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Task } from 'src/task/schema/task.schema';
import { User } from 'src/user/schema/user.schema';

export type AssignTaskDocument = HydratedDocument<AssignTask>;

@Schema()
export class AssignTask {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Task.name })
  task: Task;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  worker: User;

  @Prop({ default: Date.now() })
  dateAssign: number;
}

export const AssignTaskSchema = SchemaFactory.createForClass(AssignTask);
