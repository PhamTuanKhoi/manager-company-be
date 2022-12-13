import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './interfaces/jwtPayload.interface';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private jwtService: JwtService,
  ) {}
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userService.findByUsername(username);
    const match = await bcrypt.compare(pass, user.password);

    if (user && match) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(input: any) {
    const user = await this.userService.findByUsername(input.username);

    const payload = { username: user.username, sub: user._id };
    return {
      user,
      access_token: this.jwtService.sign(payload),
    };
  }

  async getUserFromJwtPayload({ _id }: JwtPayload) {
    const user = await this.userService.findOne(_id);
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    return user;
  }
}
