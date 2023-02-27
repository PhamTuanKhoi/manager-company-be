import { IsOptional, IsString } from 'class-validator';
import { QueryDto } from 'src/gobal/dto/query.dto';

export class QueryUserAttendaceDto extends QueryDto {
  @IsOptional()
  @IsString()
  project: string;

  @IsOptional()
  @IsString()
  date: string;
}
