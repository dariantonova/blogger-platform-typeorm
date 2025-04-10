import { IsStringOfLengthWithTrim } from '../../../../../core/decorators/validation/is-string-of-length-with-trim';
import { contentConstraints } from '../../domain/comment.entity';
import { IsNotEmpty } from 'class-validator';

export class UpdateCommentInputDto {
  @IsStringOfLengthWithTrim(
    contentConstraints.minLength,
    contentConstraints.maxLength,
  )
  @IsNotEmpty()
  content: string;
}
