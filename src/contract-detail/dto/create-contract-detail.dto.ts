import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { CreateUserDetailDto } from 'src/user-detail/dto/create-user-detail.dto';
import { CreateClientDto } from 'src/user/dto/create-dto/create-client.dto';
import { CreateWorkerDto } from 'src/user/dto/create-dto/create-worker.dto';

type CreateWorkerDtoCustom = Omit<
  CreateWorkerDto,
  'password' | 'confirmPasword' | 'email' | 'avatar'
>;
export class CreateContractDetailDto {
  @IsNotEmpty()
  @IsString()
  base: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  date: number;

  @IsNotEmpty()
  @IsString()
  rules: string;

  @IsNotEmpty()
  client: { nationnality: string } & CreateClientDto;

  @IsNotEmpty()
  worker: CreateWorkerDtoCustom & CreateUserDetailDto;

  @IsNotEmpty()
  contractCategoryId: String;
}
