import { INestApplication } from '@nestjs/common';
import { HttpExceptionsFilter } from '../core/exceptions/filters/http-exceptions.filter';
import { ErrorExceptionFilter } from '../core/exceptions/filters/error-exceptions.filter';

export function filtersSetup(app: INestApplication) {
  app.useGlobalFilters(new ErrorExceptionFilter(), new HttpExceptionsFilter());
}
