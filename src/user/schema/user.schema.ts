import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { EmployeeDepartmentEnum } from '../../gobal/department-employess.enum';
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

  // client

  @Prop()
  company: string;

  @Prop()
  field: string;

  @Prop()
  image: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
