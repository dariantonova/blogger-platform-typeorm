import { IsStringOfLengthWithTrim } from '../../../../../core/decorators/validation/is-string-of-length-with-trim';
import { contentConstraints } from '../../../comments/domain/comment.entity';
import { IsNotEmpty } from 'class-validator';

export class CreatePostCommentInputDto {
  @IsStringOfLengthWithTrim(
    contentConstraints.minLength,
    contentConstraints.maxLength,
  )
  @IsNotEmpty()
  content: string;
}
