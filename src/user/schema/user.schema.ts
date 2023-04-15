import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { EmployeeDepartmentEnum } from '../interfaces/department-employess.enum';
import { UserGenderEnum } from '../interfaces/gender-enum';
import { UserRoleEnum } from '../interfaces/role-user.enum';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
})
export class User {
  @Prop()
  username: string;

  @Prop()
  email: string;

  @Prop({ select: false })
  password: string;

  @Prop()
  role: UserRoleEnum;

  @Prop()
  name: string;

  @Prop()
  cccd: string;

  @Prop()
  department: EmployeeDepartmentEnum;

  @Prop()
  mobile: string;

  @Prop()
  date: number;

  @Prop()
  address: string;

  @Prop()
  avatar: string;

  // client

  @Prop()
  company: string;

  @Prop()
  field: string;

  @Prop()
  image: string;

  @Prop()
  tax: string;

  //worker
  @Prop()
  gender: UserGenderEnum;

  @Prop()
  token: string;

  @Prop()
  fieldContent: string;

  @Prop({ default: false })
  excellent: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
