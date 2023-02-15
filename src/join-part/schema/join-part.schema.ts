import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Part } from 'src/part/schema/part.schema';
import { User } from 'src/user/schema/user.schema';

export type JoinPartDocument = HydratedDocument<JoinPart>;

@Schema({
  timestamps: true,
})
export class JoinPart {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => User })
  joinor: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => Part })
  part: Part;

  @Prop()
  role: string;

  @Prop({ default: Date.now() })
  date: number;
}

export const JoinPartSchema = SchemaFactory.createForClass(JoinPart);
