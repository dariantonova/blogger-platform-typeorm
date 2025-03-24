import { IsStringOfLengthWithTrim } from '../../../../../core/decorators/validation/is-string-of-length-with-trim';
import {
  contentConstraints,
  shortDescriptionConstraints,
  titleConstraints,
} from '../../domain/post.entity';
import { IsMongoId, IsString } from 'class-validator';
import { Trim } from '../../../../../core/decorators/transform/trim';
import { IsExistingBlogId } from '../validation/is-existing-blog-id.decorator';

export class UpdatePostInputDto {
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

  @IsString()
  @Trim()
  @IsMongoId()
  @IsExistingBlogId()
  blogId: string;
}
