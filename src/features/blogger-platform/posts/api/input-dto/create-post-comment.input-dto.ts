import { IsStringOfLengthWithTrim } from '../../../../../core/decorators/validation/is-string-of-length-with-trim';
import { IsNotEmpty } from 'class-validator';
import { contentConstraints } from '../../../comments/domain/comment-constraints';

export class CreatePostCommentInputDto {
  @IsStringOfLengthWithTrim(
    contentConstraints.minLength,
    contentConstraints.maxLength,
  )
  @IsNotEmpty()
  content: string;
}
