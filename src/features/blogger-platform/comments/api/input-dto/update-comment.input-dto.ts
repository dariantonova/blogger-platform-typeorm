import { IsStringOfLengthWithTrim } from '../../../../../core/decorators/validation/is-string-of-length-with-trim';
import { IsNotEmpty } from 'class-validator';
import { contentConstraints } from '../../domain/comment-constraints';

export class UpdateCommentInputDto {
  @IsStringOfLengthWithTrim(
    contentConstraints.minLength,
    contentConstraints.maxLength,
  )
  @IsNotEmpty()
  content: string;
}
