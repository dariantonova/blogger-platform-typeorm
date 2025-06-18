import { IsStringOfLengthWithTrim } from '../../../../../core/decorators/validation/is-string-of-length-with-trim';
import { IsNotEmpty } from 'class-validator';
import {
  contentConstraints,
  shortDescriptionConstraints,
  titleConstraints,
} from '../../../posts/domain/post-constraints';

export class UpdateBlogPostInputDto {
  @IsStringOfLengthWithTrim(
    titleConstraints.minLength,
    titleConstraints.maxLength,
  )
  @IsNotEmpty()
  title: string;

  @IsStringOfLengthWithTrim(
    shortDescriptionConstraints.minLength,
    shortDescriptionConstraints.maxLength,
  )
  @IsNotEmpty()
  shortDescription: string;

  @IsStringOfLengthWithTrim(
    contentConstraints.minLength,
    contentConstraints.maxLength,
  )
  @IsNotEmpty()
  content: string;
}
