import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpException,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { ExtendedRequest } from 'src/auth/types/types';
import { UsersService } from './users.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { User, UserDocument } from './user.schema';
import { Roles } from 'src/auth/roles.decorator';
import { UpdateUserDto } from './dto/updateUser.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateAddressDto } from './dto/userAddress.dto';
import { UpdateUserByAdmin } from './dto/UpdateUserByAdmin.dto';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get('me')
  async getUser(@Req() request: ExtendedRequest): Promise<User> {
    return request.user;
  }

  @Put('me')
  async updateUserDetails(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersService.findById(req.user.id);
    if (!user) {
      throw new HttpException(
        {
          message: 'User does not exists',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Update user data (excluding avatar for now)
    user.name = updateUserDto.name;
    user.email = updateUserDto.email;

    // Validate and save user data
    await user.validate(); // Enforce user model validation (if defined)
    await user.save(); // Persist changes to database

    return user;
  }

  @Put('updateAvatar')
  @UseInterceptors(FileInterceptor('file'))
  async updateAvatar(
    @Req() req,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 10 * 1024 * 1024,
            message: 'File should be less than 10MB',
          }),
          new FileTypeValidator({ fileType: 'image/jpeg' || 'image/png' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    // Handle avatar update (if provided)
    const cloudinaryResponse = await this.cloudinaryService.uploadFile(
      file,
      'avatar',
    );

    if ('http_code' in cloudinaryResponse) {
      throw new HttpException(
        { message: 'Internal Server Error' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const user = await this.usersService.findById(req.user.id); // Access user ID from JWT
    if (!user) {
      throw new HttpException(
        {
          message: 'User does not exists',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    user.avatar.public_id = cloudinaryResponse.public_id;
    user.avatar.url = cloudinaryResponse.url;

    // Validate and save user data
    await user.validate(); // Enforce user model validation (if defined)
    await user.save(); // Persist changes to database

    return { success: true };
  }

  @Put('address')
  async updateAddress(@Req() req, @Body() updateAddressDto: UpdateAddressDto) {
    const updatedUser = await this.usersService.updateAddress(
      req.user.id,
      updateAddressDto,
    );
    return {
      message: 'Address updated successfully',
      user: updatedUser,
    };
  }

  @Get('address')
  async getAddress(@Req() req) {
    const address = await this.usersService.getAddress(req.user.id);

    if (!address) {
      throw new HttpException('No address found', HttpStatus.NOT_FOUND);
    }

    return { message: 'Address retrieved successfully', address };
  }

  @Delete('address')
  async deleteAddress(@Req() req) {
    const user = await this.usersService.deleteAddress(req.user.id);

    if (!user) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      message: 'Address deleted successfully',
    };
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getAllUsers(): Promise<User[]> {
    return await this.usersService.findAll();
  }

  // Get user information by admin
  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getSingleUser(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findById(id);

    if (!user) {
      throw new HttpException('No user found', HttpStatus.NOT_FOUND);
    }

    return {
      user,
    };
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async updateUserDetailsByAdmin(
    @Body() updateUserDto: UpdateUserByAdmin,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new HttpException(
        {
          message: 'User does not exists',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // Update user data (excluding avatar for now)
    user.name = updateUserDto.name;
    user.email = updateUserDto.email;
    user.role = updateUserDto.role;

    // Validate and save user data
    await user.validate(); // Enforce user model validation (if defined)
    await user.save(); // Persist changes to database

    return user;
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async deleteUserByAdmin(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new HttpException(
        {
          message: 'User does not exists',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    await this.usersService.deleteUser(id);

    return true;
  }
}
