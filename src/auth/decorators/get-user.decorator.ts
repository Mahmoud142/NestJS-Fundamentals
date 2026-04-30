import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const GetUser = createParamDecorator(
    (data: string | undefined, ctx: ExecutionContext) => {
        const request: Request = ctx.switchToHttp().getRequest<Request>();
        const user = request.user as Record<string, unknown> | undefined;
        // if data is provided, return the specific field
        if (data && user) {
            return user[data];
        }
        //  otherwise return the whole user object
        return user;
    },
);
