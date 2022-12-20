import { IsOptional, IsString } from 'class-validator';
import { PersonalInfor } from 'src/gobal/personal-infor';

export class CreateWorkerDto extends PersonalInfor {
  @IsOptional()
  @IsString()
  creator: string;
}
