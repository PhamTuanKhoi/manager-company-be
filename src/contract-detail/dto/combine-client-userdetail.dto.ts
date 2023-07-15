import { IsNotEmpty, IsString } from 'class-validator';
import { CreateClientDto } from 'src/user/dto/create-dto/create-client.dto';

export class CombinedClientAndUserDto extends CreateClientDto {
  @IsNotEmpty()
  @IsString()
  nationality: string;

  @IsNotEmpty()
  @IsString()
  _id: string;
}
