import { IsStringOfLengthWithTrim } from '../../../../../core/decorators/validation/is-string-of-length-with-trim';
import {
  descriptionConstraints,
  nameConstraints,
  websiteUrlConstraints,
} from '../../domain/blog.entity';
import { IsNotEmpty, Matches } from 'class-validator';

export class UpdateBlogInputDto {
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
