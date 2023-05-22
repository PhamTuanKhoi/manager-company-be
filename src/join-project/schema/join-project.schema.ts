import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Project } from 'src/project/schema/project.schema';
import { UserRoleEnum } from 'src/user/interfaces/role-user.enum';
import { User } from 'src/user/schema/user.schema';

export type JoinProjectDocument = HydratedDocument<JoinProject>;

@Schema({
  timestamps: true,
})
export class JoinProject {
  @Prop()
  role: UserRoleEnum;

  @Prop({ default: Date.now() })
  date: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => User })
  joinor: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => Project })
  project: Project;

  @Prop({ default: true })
  status: Boolean;

  @Prop({ default: true })
  premiumsInsurance: Boolean;
}

export const JoinProjectSchema = SchemaFactory.createForClass(JoinProject);
