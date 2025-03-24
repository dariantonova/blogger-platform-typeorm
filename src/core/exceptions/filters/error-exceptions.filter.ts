import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(Error)
export class ErrorExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (process.env.environment !== 'production') {
      response
        .status(500)
        .json({ error: exception.toString(), stack: exception.stack });
    } else {
      response.status(500).send('Some error occurred');
    }
  }
}
