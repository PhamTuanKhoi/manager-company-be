import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from 'src/user/schema/user.schema';

export type UserDetailDocument = HydratedDocument<UserDetail>;

@Schema({
  timestamps: true,
})
export class UserDetail {
  @Prop()
  nationality: string;

  @Prop()
  bornAt?: string;

  @Prop()
  resident?: string;

  @Prop()
  dateCccd?: number;

  @Prop()
  cccdAt?: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  user: User;
}

export const UserDetailSchema = SchemaFactory.createForClass(UserDetail);
