import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateDepartmentDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  name: string;
}
