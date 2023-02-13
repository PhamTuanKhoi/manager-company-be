import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { UserRoleEnum } from 'src/user/interfaces/role-user.enum';

export class CreateJoinProjectDto {
  @IsNotEmpty()
  @IsEnum(UserRoleEnum)
  role: UserRoleEnum;

  @IsNotEmpty()
  @IsString()
  joinor: string;

  @IsNotEmpty()
  @IsString()
  project: string;
}
