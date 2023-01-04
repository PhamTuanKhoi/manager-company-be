import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PersonalInfor } from 'src/gobal/personal-infor';

export class CreateClientDto extends PersonalInfor {
  @IsNotEmpty()
  @IsString()
  company: string;

  @IsNotEmpty()
  @IsString()
  field: string;

  @IsOptional()
  @IsString()
  creator: string;

  @IsOptional()
  @IsString()
  tax: string;
}
