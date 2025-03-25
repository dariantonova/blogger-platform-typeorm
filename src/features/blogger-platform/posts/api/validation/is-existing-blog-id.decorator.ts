import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';

@ValidatorConstraint({ name: 'IsExistingBlogId', async: true })
@Injectable()
export class IsExistingBlogIdConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async validate(value: any) {
    try {
      const blog = await this.blogsRepository.findById(value);
      return !!blog;
    } catch (e) {
      return false;
    }
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `Blog with id ${validationArguments?.value} does not exist`;
  }
}

export function IsExistingBlogId(
  property?: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: IsExistingBlogIdConstraint,
    });
  };
}
