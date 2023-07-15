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
  client: { nationality: string } & CreateClientDto;

  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => CombinedWorkerAndUserDto)
  worker: CreateWorkerDtoCustom & CreateUserDetailDto;

  @IsNotEmpty()
  @IsString()
  contractCategoryId: String;

  @IsNotEmpty()
  @IsString()
  creator: String;
}
