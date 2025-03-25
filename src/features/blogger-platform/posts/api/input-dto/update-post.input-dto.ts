import { IsStringOfLengthWithTrim } from '../../../../../core/decorators/validation/is-string-of-length-with-trim';
import {
  contentConstraints,
  shortDescriptionConstraints,
  titleConstraints,
} from '../../domain/post.entity';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '../../../../../core/decorators/transform/trim';
import { IsExistingBlogId } from '../validation/is-existing-blog-id.decorator';

export class UpdatePostInputDto {
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

  @IsExistingBlogId()
  @IsMongoId()
  @Trim()
  @IsString()
  @IsNotEmpty()
  blogId: string;
}
