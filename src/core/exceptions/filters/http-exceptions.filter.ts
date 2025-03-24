import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { FieldError } from '../field-error';

@Catch(HttpException)
export class HttpExceptionsFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    if (status === 500 && process.env.environment !== 'production') {
      response.status(status).json(exception);
      return;
    }

    if (status === 400) {
      const errorResult: { errorsMessages: FieldError[] } = {
        errorsMessages: [],
      };
      const exceptionResponse: any = exception.getResponse();
      exceptionResponse.errors.forEach((error: FieldError) =>
        errorResult.errorsMessages.push(error),
      );

      response.status(status).json(errorResult);
      return;
    }

    response.sendStatus(status);
  }
}
