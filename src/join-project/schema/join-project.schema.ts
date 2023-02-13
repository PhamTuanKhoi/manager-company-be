import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Project } from 'src/project/schema/project.schema';
import { User } from 'src/user/schema/user.schema';

export type JoinProjectDocument = HydratedDocument<JoinProject>;

@Schema({
  timestamps: true,
})
export class JoinProject {
  @Prop()
  role: number;

  @Prop()
  date: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => User })
  joinor: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => Project })
  project: Project;
}

export const JoinProjectSchema = SchemaFactory.createForClass(JoinProject);
