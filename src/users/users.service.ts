import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './user.schema';
import { Model, Types } from 'mongoose';
import { RegisterUserDto } from 'src/auth/dto/register.dto';
import { UpdateAddressDto } from './dto/userAddress.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findById(id: Types.ObjectId | number): Promise<UserDocument> {
    const user = await this.userModel.findById(id);
    return user;
  }

  async findByIdWithPassword(id: number | Types.ObjectId): Promise<User> {
    const user = await this.userModel.findById(id).select({ password: true });
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ email: email });
    return user;
  }

  async findAll(): Promise<User[]> {
    const users = await this.userModel.find();
    return users;
  }

  async createUser(userData: RegisterUserDto): Promise<boolean> {
    const user = await this.userModel.create(userData);
    return user ? true : false;
  }

  async updateAddress(
    userId: string,
    address: UpdateAddressDto,
  ): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: { address } },
      { new: true }, // Return the updated user
    );
    return user;
  }

  async getAddress(userId: string): Promise<UpdateAddressDto> {
    const user = await this.userModel.findById(userId);
    return user.address;
  }

  async deleteAddress(userId: string): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $unset: { address: 1 } },
      { new: true }, // Return the updated user
    );

    return user;
  }

  async deleteUser(userId: number) {
    const user = await this.userModel.findByIdAndDelete(userId);

    return user;
  }
}
