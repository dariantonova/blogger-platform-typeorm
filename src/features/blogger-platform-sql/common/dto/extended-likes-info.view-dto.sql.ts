import { LikeStatus } from '../../../blogger-platform/likes/dto/like-status';
import { BaseLikesInfoViewDtoSql } from './base-likes-info.view-dto.sql';
import { LikeDetailsViewDtoSql } from './like-details.view-dto.sql';
import { ExtendedLikesInfoDtoSql } from './extended-likes-info.dto.sql';

export class ExtendedLikesInfoViewDtoSql extends BaseLikesInfoViewDtoSql {
  newestLikes: LikeDetailsViewDtoSql[];

  static mapToView(
    extendedLikesInfo: ExtendedLikesInfoDtoSql,
    myStatus: LikeStatus,
  ): ExtendedLikesInfoViewDtoSql {
    const dto = new ExtendedLikesInfoViewDtoSql();

    dto.likesCount = extendedLikesInfo.likesCount;
    dto.dislikesCount = extendedLikesInfo.dislikesCount;
    dto.myStatus = myStatus;
    dto.newestLikes = extendedLikesInfo.newestLikes.map(
      LikeDetailsViewDtoSql.mapToView,
    );

    return dto;
  }
}
