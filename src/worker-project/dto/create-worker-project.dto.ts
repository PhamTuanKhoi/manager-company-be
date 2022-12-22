import { IsNotEmpty, IsString } from 'class-validator';

export class CreateWorkerProjectDto {
  @IsNotEmpty()
  @IsString()
  project: string;

  @IsNotEmpty()
  @IsString()
  worker: string;
}
