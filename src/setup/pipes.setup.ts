import {
  INestApplication,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { FieldError } from '../core/exceptions/field-error';
import { DomainException } from '../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../core/exceptions/domain-exception-code';

const formatErrors = (errors: ValidationError[]): FieldError[] => {
  const errorsForResponse: FieldError[] = [];
  errors.forEach((error) => {
    const field = error.property;
    for (const key in error.constraints) {
      const message = error.constraints[key];
      errorsForResponse.push({
        field,
        message,
      });
    }
  });
  return errorsForResponse;
};

export function pipesSetup(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const formattedErrors = formatErrors(errors);
        throw new DomainException({
          code: DomainExceptionCode.BadRequest,
          message: 'Bad request',
          extensions: formattedErrors,
        });
      },
    }),
  );
}
