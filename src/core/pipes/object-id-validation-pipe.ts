import { NotFoundException, PipeTransform } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

export class ObjectIdValidationPipe implements PipeTransform {
  transform(value: any): any {
    if (!isValidObjectId(value)) {
      throw new NotFoundException('Invalid ObjectId: ' + value);
    }

    return value;
  }
}
