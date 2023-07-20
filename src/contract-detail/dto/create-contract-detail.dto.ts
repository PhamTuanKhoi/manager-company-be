import { Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateUserDetailDto } from 'src/user-detail/dto/create-user-detail.dto';
import { CreateClientDto } from 'src/user/dto/create-dto/create-client.dto';
import { CreateWorkerDto } from 'src/user/dto/create-dto/create-worker.dto';
import { CombinedClientAndUserDto } from './combine-client-userdetail.dto';
import { CombinedWorkerAndUserDto } from './combine-worker-userdetail.dto';

type CreateWorkerDtoCustom = Omit<
  CreateWorkerDto,
  'password' | 'confirmPasword' | 'email' | 'avatar'
>;

export class CreateContractDetailDto {
  @IsNotEmpty()
  @IsString()
  base: string;

  @IsNotEmpty()
  @IsString()
  at: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  date: number;

  @IsNotEmpty()
  @IsString()
  rules: string;

  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => CreateClientDto)
  client: CombinedClientAndUserDto;

  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => CombinedWorkerAndUserDto)
  worker: CombinedWorkerAndUserDto;

  @IsNotEmpty()
  @IsString()
  contractCategoryId: String;

  @IsNotEmpty()
  @IsString()
  projectId: String;

  @IsNotEmpty()
  @IsString()
  creator: String;
}
