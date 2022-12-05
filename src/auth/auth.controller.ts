import {
  Controller,
  Post,
  Body,
  forwardRef,
  Inject,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RegisterUserDto } from 'src/user/dto/register-user.dto';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guard/local-auth.guard';

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

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }
}
