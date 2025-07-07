import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  Injectable,
} from '@nestjs/common';
import { CoreConfig, Environment } from '../../core.config';
import { Request, Response } from 'express';

@Injectable()
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private coreConfig: CoreConfig) {}

  catch(exception: any, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    console.error(exception);

    if (this.coreConfig.env !== Environment.PRODUCTION) {
      response
        .status(500)
        .json({ error: exception.toString(), stack: exception.stack });
    } else {
      response.status(500).send('Some error occurred');
    }
  }
}
