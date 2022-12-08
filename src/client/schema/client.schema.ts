import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ClientDocument = HydratedDocument<Client>;

@Schema({
  timestamps: true,
})
export class Client {
  @Prop()
  name: string;

  @Prop()
  representative: string;

  @Prop()
  email: number;

  @Prop()
  phone: string;

  @Prop()
  company: string;

  @Prop()
  field: string;

  @Prop()
  image: string;
}

export const ClientSchema = SchemaFactory.createForClass(Client);
