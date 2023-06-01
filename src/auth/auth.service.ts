import {
  BadRequestException,
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
import { emailrgx, phonergx } from 'src/gobal/regex';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private jwtService: JwtService,
  ) {}
  async validateUser(username: string, pass: string): Promise<any> {
    // login email
    if (emailrgx.test(username)) {
      const user_by_email = await this.userService.findByEmail(username);

      if (!user_by_email)
        throw new HttpException(
          `Không tìm thấy email !`,
          HttpStatus.BAD_GATEWAY,
        );

      const match_email = await bcrypt.compare(pass, user_by_email?.password);

      if (!match_email)
        throw new HttpException(
          `Mật khẩu không chính xác !`,
          HttpStatus.BAD_GATEWAY,
        );

      if (user_by_email && match_email) {
        const { password, ...result } = user_by_email;
        return result;
      }
    }

    // login phone number
    if (phonergx.test(username)) {
      const user_by_phone = await this.userService.findByPhone(username);

      if (!user_by_phone)
        throw new HttpException(
          `Không tìm thấy số điện thoại !`,
          HttpStatus.BAD_GATEWAY,
        );

      const match_phone = await bcrypt.compare(pass, user_by_phone?.password);

      if (!match_phone)
        throw new HttpException(
          `Mật khẩu không chính xác !`,
          HttpStatus.BAD_GATEWAY,
        );

      if (user_by_phone && match_phone) {
        const { password, ...result } = user_by_phone;
        return result;
      }
    }

    return null;
  }

  async login(input: any) {
    const user = await this.userService.findByEmail(input.email);

    const payload = { email: user.email, sub: user._id };
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

  async getUserFromHeader(jwt: string) {
    if (!jwt) return;

    try {
      return this.jwtService.decode(jwt);
    } catch (error) {
      throw new BadRequestException();
    }
  }
}
