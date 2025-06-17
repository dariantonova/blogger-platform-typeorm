import {
  ArgumentMetadata,
  NotFoundException,
  PipeTransform,
} from '@nestjs/common';

export class IntValidationTransformationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata): any {
    if (metadata.metatype !== Number) {
      return value;
    }

    if (!Number.isInteger(parseInt(value))) {
      throw new NotFoundException('Invalid integer: ' + value);
    }

    return Number(value);
  }
}
