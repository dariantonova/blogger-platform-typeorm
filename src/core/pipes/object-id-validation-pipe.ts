import { PipeTransform } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';
import { DomainException } from '../exceptions/domain-exception';
import { DomainExceptionCode } from '../exceptions/domain-exception-code';

export class ObjectIdValidationPipe implements PipeTransform {
  transform(value: any): any {
    if (!isValidObjectId(value)) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Invalid ObjectId: ' + value,
      });
    }

    return value;
  }
}
