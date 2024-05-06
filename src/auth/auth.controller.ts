import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register.dto';
import { UsersService } from 'src/users/users.service';
import { LoginUserDto } from './dto/login.dto';
import { Response } from './types/types';
import { Response as ExpressResponse, Request } from 'express';

@Controller('/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('/register')
  async register(@Body() registerUserDto: RegisterUserDto): Promise<Response> {
    const user = await this.usersService.findByEmail(registerUserDto.email);

    if (user) {
      throw new HttpException(
        {
          message: 'User already exists with this email',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const success = await this.authService.registerUser(registerUserDto);
    if (!success) {
      throw new HttpException(
        { message: 'Internal server error' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return { message: 'registered', success: success };
  }

  @Post('/login')
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) response: ExpressResponse,
    @Req() request: Request,
  ): Promise<Response> {
    if (request.cookies['token']) {
      throw new HttpException(
        {
          message: 'You Have Already logged in',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.usersService.findByEmail(loginUserDto.email);

    if (!user) {
      throw new HttpException(
        {
          message: 'User does not exists with this email',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const isPasswordMatch = await this.authService.comparePassword(
      user._id,
      loginUserDto.password,
    );

    if (!isPasswordMatch) {
      throw new UnauthorizedException();
    }

    const token = await this.authService.getJwt(user._id);

    if (token === false) {
      throw new HttpException(
        { message: 'Internal Server Error' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    response.cookie('token', token);

    return {
      message: 'Logged in successfully',
      success: true,
    };
  }
}
