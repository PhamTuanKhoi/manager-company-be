import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Department } from 'src/department/schema/department.schema';
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

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Department.name })
  department: Department;

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
