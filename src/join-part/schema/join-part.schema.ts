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

  // @Prop({ default: Date.now() })
  // date: number;

  // ===================== WARNING TESTSSSSSSS =======================
  @Prop()
  date: string;

  @Prop({ type: { timein: Number, timeout: Number } })
  hour: object;

  @Prop()
  id: number;

  @Prop()
  sort: number;
}

export const JoinPartSchema = SchemaFactory.createForClass(JoinPart);
