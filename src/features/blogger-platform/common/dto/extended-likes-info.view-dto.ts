import { BaseLikesInfoViewDto } from './base-likes-info.view-dto';
import { LikeDetailsViewDto } from './like-details.view-dto';

export class ExtendedLikesInfoViewDto extends BaseLikesInfoViewDto {
  newestLikes: LikeDetailsViewDto[];
}
