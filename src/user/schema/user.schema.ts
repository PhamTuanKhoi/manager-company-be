import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { EmployeeDepartmentEnum } from '../interfaces/department-employess.enum';
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

  @Prop()
  password: string;

  @Prop()
  role: UserRoleEnum;

  @Prop()
  name: string;

  @Prop()
  cccd: number;

  @Prop()
  department: EmployeeDepartmentEnum;

  @Prop()
  mobile: number;

  @Prop()
  date: number;

  @Prop()
  address: string;

  @Prop()
  avartar: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
