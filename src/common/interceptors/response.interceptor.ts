import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';

export interface ResponseFormat<T> {
    status: 'success' | 'error';
    message: string;
    data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
    T,
    ResponseFormat<T>
> {
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<ResponseFormat<T>> {
        const ctx = context.switchToHttp();
        const response = ctx.getResponse<Response>();

        return next.handle().pipe(
            map((data: unknown) => {
                // Skip if headers are already sent (e.g. res.redirect)
                if (response.headersSent) {
                    return data as ResponseFormat<T>;
                }

                // If the response is already formatted correctly, return it
                if (
                    data &&
                    typeof data === 'object' &&
                    !Array.isArray(data) &&
                    'status' in data &&
                    ((data as Record<string, unknown>).status === 'success' ||
                        (data as Record<string, unknown>).status === 'error')
                ) {
                    return data as ResponseFormat<T>;
                }

                let message = '';
                let responseData: unknown = data;

                // Extract message if it exists in the top level of the returned object
                if (
                    data &&
                    typeof data === 'object' &&
                    !Array.isArray(data) &&
                    'message' in data
                ) {
                    message = String((data as Record<string, unknown>).message);
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { message: _, ...rest } = data as Record<
                        string,
                        unknown
                    >;
                    // If after extracting message, the object has other properties, return them, else empty object
                    responseData = Object.keys(rest).length ? rest : {};
                }

                return {
                    status: 'success',
                    message,
                    data: (responseData ?? {}) as T,
                };
            }),
        );
    }
}
