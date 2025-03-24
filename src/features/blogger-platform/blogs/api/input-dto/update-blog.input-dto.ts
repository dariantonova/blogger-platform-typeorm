import { IsStringOfLengthWithTrim } from '../../../../../core/decorators/validation/is-string-of-length-with-trim';
import {
  descriptionConstraints,
  nameConstraints,
  websiteUrlConstraints,
} from '../../domain/blog.entity';
import { Matches } from 'class-validator';

export class UpdateBlogInputDto {
  @IsStringOfLengthWithTrim(
    nameConstraints.minLength,
    nameConstraints.maxLength,
  )
  name: string;

  @IsStringOfLengthWithTrim(
    descriptionConstraints.minLength,
    descriptionConstraints.maxLength,
  )
  description: string;

  @IsStringOfLengthWithTrim(
    websiteUrlConstraints.minLength,
    websiteUrlConstraints.maxLength,
  )
  @Matches(websiteUrlConstraints.match)
  websiteUrl: string;
}
