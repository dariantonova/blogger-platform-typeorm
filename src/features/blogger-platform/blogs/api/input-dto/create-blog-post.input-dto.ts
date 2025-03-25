import { IsStringOfLengthWithTrim } from '../../../../../core/decorators/validation/is-string-of-length-with-trim';
import {
  contentConstraints,
  shortDescriptionConstraints,
  titleConstraints,
} from '../../../posts/domain/post.entity';
import { IsNotEmpty } from 'class-validator';

export class CreateBlogPostInputDto {
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
