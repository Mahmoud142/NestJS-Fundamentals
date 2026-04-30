import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(ctx: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
            ROLES_KEY,
            [ctx.getHandler(), ctx.getClass()],
        );

        // No @Roles() decorator → allow access
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const request = ctx
            .switchToHttp()
            .getRequest<{ user?: { role?: string } }>();
        const user = request.user;

        if (!user || !user.role) {
            return false;
        }

        return requiredRoles.includes(user.role as Role);
    }
}
