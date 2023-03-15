import { Prop } from '@nestjs/mongoose';

export class Time {
  @Prop()
  datetime: number;

  @Prop({ default: new Date().getFullYear() })
  year: number;

  @Prop({ default: new Date().getMonth() + 1 })
  month: number;

  @Prop({ default: new Date().getDate() })
  date: number;

  @Prop({ default: 0 })
  timein: number;

  @Prop({ default: 0 })
  timeout?: number;
}
