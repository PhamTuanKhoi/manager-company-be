import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { QueryDto } from 'src/gobal/dto/query.dto';

export class QueryUserAttendaceDto extends QueryDto {
  @IsOptional()
  @IsString()
  project: string;

  @IsOptional()
  @IsString()
  year: string;

  @IsOptional()
  @IsString()
  month: string;

  @IsOptional()
  @IsString()
  date: string;

  @IsOptional()
  status: string;
}
