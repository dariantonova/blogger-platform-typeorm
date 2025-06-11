import { NotFoundException, PipeTransform } from '@nestjs/common';

export class IntValidationPipe implements PipeTransform {
  transform(value: any): any {
    if (!Number.isInteger(parseInt(value))) {
      throw new NotFoundException('Invalid integer: ' + value);
    }

    return value;
  }
}
