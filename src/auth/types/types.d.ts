import { Request } from 'express';
import { User } from 'src/users/user.schema';

export interface Response {
  message: string;
  success: boolean;
}

export interface ExtendedRequest extends Request {
  user: User;
}
