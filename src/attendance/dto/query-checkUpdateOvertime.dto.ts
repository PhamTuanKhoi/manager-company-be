import { Overtime } from 'src/overtime/schema/overtime.schema';
import { Attendance } from '../schema/attendance.schema';

export class QueryCheckUpdateOvertimeDto {
  project?: string;
  user?: string;
  attendanceId?: string;
  attendance?: Attendance;
  todayOvertime?: Overtime[];
  timeout?: number;
  timein?: number;
  toDate?: {
    year: number;
    month: number;
    date: number;
  };
}
