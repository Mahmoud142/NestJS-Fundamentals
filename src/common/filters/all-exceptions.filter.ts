import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            } else if (
                typeof exceptionResponse === 'object' &&
                exceptionResponse !== null
            ) {
                // Usually validation pipes return an object with message as array of strings
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
                const msg = (exceptionResponse as any).message;
                message = Array.isArray(msg)
                    ? msg.join(', ')
                    : typeof msg === 'string'
                      ? msg
                      : message;
            }
        } else if (exception instanceof Error) {
            message = exception.message;
        }

        // Do not attempt to send if headers are already sent
        if (response.headersSent) {
            return;
        }

        response.status(status).json({
            status: 'error',
            message: message,
            data: {},
        });
    }
}
