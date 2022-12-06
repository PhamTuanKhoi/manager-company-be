import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type EmployeeDocument = HydratedDocument<Employee>;

export class Employee {}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);
