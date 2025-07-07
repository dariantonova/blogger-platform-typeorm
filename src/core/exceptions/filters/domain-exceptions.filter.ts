import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { FieldError } from '../field-error';
import { DomainException } from '../domain-exception';
import { DomainExceptionCode } from '../domain-exception-code';
import { CoreConfig, Environment } from '../../core.config';

@Injectable()
@Catch(DomainException)
export class DomainExceptionsFilter implements ExceptionFilter {
  constructor(private coreConfig: CoreConfig) {}

  catch(exception: DomainException, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = this.mapToHttpStatus(exception.code);

    if (status === 500 && this.coreConfig.env !== Environment.PRODUCTION) {
      response.status(status).json(exception);
      return;
    }

    if (status === 400) {
      const errorResult: { errorsMessages: FieldError[] } = {
        errorsMessages: [],
      };
      exception.extensions.forEach((error: FieldError) =>
        errorResult.errorsMessages.push(error),
      );

      response.status(status).json(errorResult);
      return;
    }

    response.sendStatus(status);
  }

  private mapToHttpStatus(code: DomainExceptionCode): number {
    switch (code) {
      case DomainExceptionCode.BadRequest:
        return HttpStatus.BAD_REQUEST;
      case DomainExceptionCode.Forbidden:
        return HttpStatus.FORBIDDEN;
      case DomainExceptionCode.NotFound:
        return HttpStatus.NOT_FOUND;
      case DomainExceptionCode.Unauthorized:
        return HttpStatus.UNAUTHORIZED;
      case DomainExceptionCode.InternalServerError:
        return HttpStatus.INTERNAL_SERVER_ERROR;
      default:
        return HttpStatus.I_AM_A_TEAPOT;
    }
  }
}
