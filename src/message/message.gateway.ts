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

    if (jwt && jwt !== null) {
      const { sub } = await this.authService.getUserFromHeader(jwt as string);

      return sub;
    }
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

  @SubscribeMessage('createMessage')
  async create(
    @MessageBody() createMessageDto: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const from = await this.redisCache.get(createMessageDto.from);
    const to = await this.redisCache.get(createMessageDto.to);

    this.server.to(from as string).emit(`message`, createMessageDto);
    this.server.to(to as string).emit(`message`, createMessageDto);

    //  save
    await this.messageService.create(createMessageDto);
  }

  @SubscribeMessage('del-key')
  async deleteKey(@MessageBody() body: { userId: string }) {
    await this.redisCache.del(body.userId);
    this.logger.debug(`del user key#${body.userId}`);
  }
}
