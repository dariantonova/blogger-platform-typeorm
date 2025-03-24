import {
  BadRequestException,
  INestApplication,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { FieldError } from '../core/exceptions/field-error';

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
        throw new BadRequestException({ errors: formattedErrors });
      },
    }),
  );
}
