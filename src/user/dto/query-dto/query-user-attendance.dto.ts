import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { QueryDto } from 'src/gobal/dto/query.dto';

export class QueryUserAttendanceDto extends QueryDto {
  @IsOptional()
  @IsString()
  project: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  year: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  month: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  date: number;

  @IsOptional()
  @IsString()
  dateStringify: string;

  @IsOptional()
  status: string;
}
