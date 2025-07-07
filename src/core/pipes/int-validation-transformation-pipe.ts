import { ArgumentMetadata, PipeTransform } from '@nestjs/common';
import { DomainException } from '../exceptions/domain-exception';
import { DomainExceptionCode } from '../exceptions/domain-exception-code';

export class IntValidationTransformationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata): any {
    if (metadata.metatype !== Number) {
      return value;
    }

    if (!Number.isInteger(parseInt(value))) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Invalid integer: ' + value,
      });
    }

    return Number(value);
  }
}
