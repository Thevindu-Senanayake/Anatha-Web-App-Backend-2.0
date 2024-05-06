import { Injectable } from '@nestjs/common';
import { RegisterUserDto } from './dto/register.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcryptjs';
import { Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async comparePassword(
    userId: Types.ObjectId,
    enteredPassword: string,
  ): Promise<boolean> {
    const user = await this.userService.findByIdWithPassword(userId);
    if (!user) return false;
    return await bcrypt.compare(enteredPassword, user.password);
  }

  async getJwt(userId: Types.ObjectId): Promise<string | boolean> {
    const user = await this.userService.findById(userId);
    if (!user) return false;

    const payload = { id: user._id };
    return await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('jwtSecret'),
    });
  }

  async registerUser(registerUserDto: RegisterUserDto): Promise<boolean> {
    try {
      const success = await this.userService.createUser(registerUserDto);
      return success;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
