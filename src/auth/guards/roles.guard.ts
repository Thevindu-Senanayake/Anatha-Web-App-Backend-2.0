import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    if (!requiredRoles) {
      return true; // Allow access if no roles are specified
    }

    const request = context.switchToHttp().getRequest();
    const userRole = request.user?.role; // Assuming user role is in request.user

    if (!userRole) {
      throw new HttpException(
        'Unauthorized: User role not found',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return requiredRoles.some((role) => role === userRole);
  }
}
