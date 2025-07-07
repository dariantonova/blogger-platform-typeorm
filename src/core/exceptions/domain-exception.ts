import { DomainExceptionCode } from './domain-exception-code';
import { FieldError } from './field-error';

export class DomainException extends Error {
  message: string;
  code: DomainExceptionCode;
  extensions: FieldError[];
  info?: any;

  constructor(errorInfo: {
    message: string;
    code: DomainExceptionCode;
    extensions?: FieldError[];
    info?: any;
  }) {
    super(errorInfo.message);
    this.message = errorInfo.message;
    this.code = errorInfo.code;
    this.extensions = errorInfo.extensions || [];
    this.info = errorInfo.info;
  }
}
