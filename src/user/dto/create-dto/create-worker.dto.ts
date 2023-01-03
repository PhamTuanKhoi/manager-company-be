import { IsOptional, IsString } from 'class-validator';
import { PersonalInfor } from 'src/gobal/personal-infor';

export class CreateWorkerDto extends PersonalInfor {
  @IsOptional()
  @IsString()
  creator: string;

  @IsOptional()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  confirmPasword: string;

  @IsOptional()
  @IsString()
  field: string;

  @IsOptional()
  @IsString()
  fieldContent: string;
}
