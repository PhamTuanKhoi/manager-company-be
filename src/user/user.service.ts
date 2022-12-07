import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-dto/create-user.dto';
import { RegisterUserDto } from './dto/create-dto/register-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRoleEnum } from './interfaces/role-user.enum';
import { User, UserDocument } from './schema/user.schema';
import * as bcrypt from 'bcrypt';
import { CreateEmployeeDto } from './dto/create-dto/create-employee.dto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(@InjectModel(User.name) private model: Model<UserDocument>) {}

  create(createUserDto: CreateUserDto) {
    return this.model.create(createUserDto);
  }

  async newEmployees(createEmployeeDto: CreateEmployeeDto) {
    const emailsake = await this.findByEmail(createEmployeeDto.email);

    if (emailsake)
      throw new HttpException('email already exists', HttpStatus.BAD_REQUEST);

    let password: string = Math.floor(
      (1 + Math.random()) * 10000001,
    ).toString();

    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'fce.analytics73@gmail.com',
        pass: 'jcvuknpxdipbrzgy',
      },
    });

    var mailOptions = {
      from: '"FCE" <huynhanhpham734@gmail.com>',
      to: createEmployeeDto.email,
      subject: 'CONG TY TNHH GIẢI PHÁP NGUỒN NHÂN LỰC FCE',
      text: 'That was easy!',
      html:
        '<p><i>Hi!  ' +
        createEmployeeDto.name +
        `</i></p><b>Mat khau cua ban la : ${password}</b>`,
    };

    const sendEmail = await transporter.sendMail(mailOptions);

    if (!sendEmail) {
      console.log(`error send mail`);
    }
    console.log('Email sent: ' + sendEmail?.response);

    password = await bcrypt.hash(password, 10);

    const created = await this.model.create({
      ...createEmployeeDto,
      password,
      role: UserRoleEnum.EMPLOYEE,
    });

    this.logger.log(`created new employees by id ${created?._id}`);

    return created;
  }

  async register(registerUserDto: RegisterUserDto) {
    try {
      const namesake = await this.findByUsername(registerUserDto.username);

      if (namesake)
        throw new HttpException(
          'username already exists',
          HttpStatus.BAD_REQUEST,
        );

      const emailsake = await this.findByEmail(registerUserDto.email);

      if (emailsake)
        throw new HttpException('email already exists', HttpStatus.BAD_REQUEST);

      registerUserDto.password = await bcrypt.hash(
        registerUserDto.password,
        10,
      );

      const created = await this.model.create({
        ...registerUserDto,
        role: UserRoleEnum.ADMIN,
      });

      this.logger.log(`Register user success`, created?._id);
      return created;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  findByUsername(username: string) {
    return this.model.findOne({ username }).lean();
  }

  findByEmail(email: string) {
    return this.model.findOne({ email });
  }

  findOne(id: string) {
    return this.model.findById(id).lean();
  }

  findAll() {
    return `This action returns all user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
