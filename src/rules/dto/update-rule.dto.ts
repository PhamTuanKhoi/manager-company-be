import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString } from 'class-validator';
import { CreateRuleDto } from './create-rule.dto';

export class UpdateRuleDto extends PartialType(CreateRuleDto) {
  @IsNotEmpty()
  @IsString()
  wiffiOld: string;

  @IsNotEmpty()
  @IsString()
  passwordOld: string;
}
