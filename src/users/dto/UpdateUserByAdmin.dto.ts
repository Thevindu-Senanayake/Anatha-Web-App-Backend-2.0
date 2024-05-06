import { IsNotEmpty, IsString } from 'class-validator';
import { UpdateUserDto } from './updateUser.dto';

export class UpdateUserByAdmin extends UpdateUserDto {
  @IsNotEmpty()
  @IsString()
  readonly role: string;
}
