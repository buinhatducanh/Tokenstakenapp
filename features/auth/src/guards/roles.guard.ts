// import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

// @Injectable()
// export class RolesGuard implements CanActivate {
//   constructor(private allowedRoles: string[]) {}

//   canActivate(context: ExecutionContext): boolean {
//     const req = context.switchToHttp().getRequest();
//     const user = req.user;

//     return this.allowedRoles.some(r => user.roles.includes(r));
//   }
// }
import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles =
      this.reflector.getAllAndOverride<string[]>(
        ROLES_KEY,
        [
          context.getHandler(),
          context.getClass(),
        ],
      );

    if (!requiredRoles) {
      return true;
    }

    const request =
      context.switchToHttp().getRequest();

    const user = request.user;

    return requiredRoles.includes(user.role);
  }
}