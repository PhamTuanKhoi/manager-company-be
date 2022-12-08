import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { EmployeeDepartmentEnum } from 'src/gobal/department-employess.enum';
import { ProjectPriorityEnum } from '../dto/interfaces/priority-enum';

export type ProjectDocument = HydratedDocument<Project>;
@Schema({
  timestamps: true,
})
export class Project {
  @Prop()
  name: string;

  @Prop()
  department: EmployeeDepartmentEnum;

  @Prop()
  priority: ProjectPriorityEnum;

  // @Prop({ ref : ()=> })
  // client: string;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
