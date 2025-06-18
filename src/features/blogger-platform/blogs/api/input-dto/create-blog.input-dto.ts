import { IsStringOfLengthWithTrim } from '../../../../../core/decorators/validation/is-string-of-length-with-trim';
import { IsNotEmpty, Matches } from 'class-validator';
import {
  descriptionConstraints,
  nameConstraints,
  websiteUrlConstraints,
} from '../../domain/blog-constraints';

export class CreateBlogInputDto {
  @IsStringOfLengthWithTrim(
    nameConstraints.minLength,
    nameConstraints.maxLength,
  )
  @IsNotEmpty()
  name: string;

  @IsStringOfLengthWithTrim(
    descriptionConstraints.minLength,
    descriptionConstraints.maxLength,
  )
  @IsNotEmpty()
  description: string;

  @Matches(websiteUrlConstraints.match)
  @IsStringOfLengthWithTrim(
    websiteUrlConstraints.minLength,
    websiteUrlConstraints.maxLength,
  )
  @IsNotEmpty()
  websiteUrl: string;
}
