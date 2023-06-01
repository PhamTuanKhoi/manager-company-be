import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { CACHE_MANAGER, Inject, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';

@WebSocketGateway({ cors: { origin: '*' } })
export class MessageGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;
  // indentify

  private readonly logger = new Logger(MessageGateway.name);
  constructor(
    private readonly messageService: MessageService,
    private readonly authService: AuthService,
    @Inject(CACHE_MANAGER) private redisCache: Cache,
  ) {}

  async getUserId(socket: Socket) {
    const jwt = socket.handshake.query.token ?? null;

    const { sub } = await this.authService.getUserFromHeader(jwt as string);

    return sub;
  }

  async handleConnection(socket: Socket, ...args: any[]) {
    const userId = await this.getUserId(socket);

    if (userId && socket.id) {
      await this.redisCache.set(userId, socket.id, 600000);
      this.logger.verbose(`set user connect key#${userId}`);
    }
  }

  async handleDisconnect(socket: Socket) {
    const userId = await this.getUserId(socket);

    if (userId) {
      await this.redisCache.del(userId);
      this.logger.debug(`del user key#${userId}`);
    }
  }

  @SubscribeMessage('inforUser')
  infor(
    @MessageBody() payload: { userid: string; socketid: string },
    @ConnectedSocket() client: Socket,
  ) {
    const infor = {
      userid: payload.userid,
      socketid: client.id,
    };

    // console.log({ infor });

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
