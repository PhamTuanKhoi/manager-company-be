import {
  Controller,
  Post,
  Body,
  forwardRef,
  Inject,
  UseGuards,
  Request,
  Get,
  Param,
} from '@nestjs/common';
import { CreateWorkerDto } from 'src/user/dto/create-dto/create-worker.dto';
import { RegisterUserDto } from 'src/user/dto/create-dto/register-user.dto';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { Auth } from './decorator/auth.decorator';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { JwtPayload } from './interfaces/jwtPayload.interface';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  @Post('register')
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.userService.register(registerUserDto);
  }

  @Post('register-user')
  registerUser(@Body() registerUserDto: CreateWorkerDto) {
    return this.userService.registerUser(registerUserDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me')
  async me(@Auth() auth: JwtPayload) {
    return await this.authService.getUserFromJwtPayload(auth);
  }
}
