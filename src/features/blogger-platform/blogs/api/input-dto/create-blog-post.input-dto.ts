import { IsStringOfLengthWithTrim } from '../../../../../core/decorators/validation/is-string-of-length-with-trim';
import {
  contentConstraints,
  shortDescriptionConstraints,
  titleConstraints,
} from '../../../posts/domain/post.entity';

export class CreateBlogPostInputDto {
  @IsStringOfLengthWithTrim(
    titleConstraints.minLength,
    titleConstraints.maxLength,
  )
  title: string;

  @IsStringOfLengthWithTrim(
    shortDescriptionConstraints.minLength,
    shortDescriptionConstraints.maxLength,
  )
  shortDescription: string;

  @IsStringOfLengthWithTrim(
    contentConstraints.minLength,
    contentConstraints.maxLength,
  )
  content: string;
}
