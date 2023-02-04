import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Project } from 'src/project/schema/project.schema';
import { Task } from 'src/task/schema/task.schema';
import { User } from 'src/user/schema/user.schema';

export type PartDocument = HydratedDocument<Part>;

@Schema({
  timestamps: true,
})
export class Part {
  @Prop()
  name: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Project.name })
  project: Project;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: User.name }] })
  workers: User[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  creator: User;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: Task.name }] })
  tasks: Task[];
}

export const PartSchema = SchemaFactory.createForClass(Part);
