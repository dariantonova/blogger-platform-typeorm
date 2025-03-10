import { BaseLikesInfoViewDto } from './base-likes-info.view-dto';
import { LikeDetailsViewDto } from './like-details.view-dto';
import { ExtendedLikesInfo } from '../schemas/extended-likes-info.schema';
import { LikeStatus } from '../../likes/dto/like-status';

export class ExtendedLikesInfoViewDto extends BaseLikesInfoViewDto {
  newestLikes: LikeDetailsViewDto[];

  static mapToView(
    extendedLikesInfo: ExtendedLikesInfo,
  ): ExtendedLikesInfoViewDto {
    const dto = new ExtendedLikesInfoViewDto();

    dto.likesCount = extendedLikesInfo.likesCount;
    dto.dislikesCount = extendedLikesInfo.dislikesCount;
    dto.myStatus = LikeStatus.None;
    dto.newestLikes = extendedLikesInfo.newestLikes.map(
      LikeDetailsViewDto.mapToView,
    );

    return dto;
  }
}
