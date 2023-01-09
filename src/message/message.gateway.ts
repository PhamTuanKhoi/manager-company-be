import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Server, Socket } from 'socket.io';
require('events').EventEmitter.defaultMaxListeners = 15;

@WebSocketGateway({ cors: { origin: '*' } })
export class MessageGateway {
  @WebSocketServer()
  server: Server;
  // indentify

  constructor(private readonly messageService: MessageService) {}

  @SubscribeMessage('inforUser')
  infor(
    @MessageBody() payload: { userid: string; socketid: string },
    @ConnectedSocket() client: Socket,
  ) {
    const infor = {
      userid: payload.userid,
      socketid: client.id,
    };

    return this.messageService.createInfor(infor);
  }

  @SubscribeMessage('createMessage')
  async create(
    @MessageBody() createMessageDto: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const data = await this.messageService.create(createMessageDto);

    this.server.to(data?.to).emit(`message`, createMessageDto);
    this.server.to(client?.id).emit(`message`, createMessageDto);

    return;
  }

  @SubscribeMessage('findOneMessage')
  findOne(@MessageBody() id: number) {
    return this.messageService.findOne(id);
  }

  @SubscribeMessage('updateMessage')
  update(@MessageBody() updateMessageDto: UpdateMessageDto) {
    return this.messageService.update(updateMessageDto.id, updateMessageDto);
  }

  @SubscribeMessage('removeMessage')
  remove(@MessageBody() id: number) {
    return this.messageService.remove(id);
  }
}
