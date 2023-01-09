import { PartialType } from '@nestjs/mapped-types';
import { CreateMessageApiDto } from './create-message-api.dto';

export class UpdateMessageApiDto extends PartialType(CreateMessageApiDto) {}
