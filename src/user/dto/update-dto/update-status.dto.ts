import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserStatusEnum } from 'src/user/interfaces/status-enum';

export class UpdateStatusDto {
  @IsNotEmpty()
  @IsEnum(UserStatusEnum)
  status: UserStatusEnum;
}
