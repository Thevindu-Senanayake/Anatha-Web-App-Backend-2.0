import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt'; // Assuming JWT authentication is used
import { Response } from 'express';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse<Response>(); // Get access to Response object

    const skipAuth = this.reflector.get<boolean>(
      'skip-auth',
      context.getHandler(),
    );

    if (skipAuth) {
      return true; // Allow access for routes with `@SkipAuth()` decorator
    }

    const token = request.cookies?.token; // Check for access token in cookie

    if (!token) {
      throw new UnauthorizedException('Access token not found');
    }

    try {
      const decoded = this.jwtService.verify(token, {
        secret: this.configService.get<string>('jwtSecret'),
      }); // Verify JWT token
      // Check if user ID exists in decoded payload
      if (!decoded.id) {
        response.clearCookie('token'); // Delete token cookie on non-Unauthorized errors
        throw new UnauthorizedException('Invalid JWT token');
      }
      const user = await this.userService.findById(decoded.id);

      if (!user) {
        response.clearCookie('token'); // Delete token cookie on non-Unauthorized errors
        throw new UnauthorizedException('Invalid JWT token');
      }

      request.user = user;

      return true;
    } catch (err) {
      console.log(err);

      response.clearCookie('token'); // Delete token cookie on non-Unauthorized errors
      throw new HttpException(
        { message: 'Internal Server Error' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
