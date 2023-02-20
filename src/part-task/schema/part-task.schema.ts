import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Part } from 'src/part/schema/part.schema';
import { Task } from 'src/task/schema/task.schema';

export type PartTaskDocument = HydratedDocument<PartTask>;

@Schema()
export class PartTask {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Part.name })
  part: Part;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Task.name })
  task: Task;

  @Prop({ default: Date.now() })
  date: number;
}

export const PartTaskSchema = SchemaFactory.createForClass(PartTask);
