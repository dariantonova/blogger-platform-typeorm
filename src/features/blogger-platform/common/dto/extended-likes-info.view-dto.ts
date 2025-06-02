import { BaseLikesInfoViewDto } from './base-likes-info.view-dto';
import { LikeDetailsViewDto } from './like-details.view-dto';
import { ExtendedLikesInfo } from '../schemas/extended-likes-info.schema';
import { LikeStatus } from '../../likes/dto/like-status';
import { ExtendedLikesInfoDtoSql } from '../../../blogger-platform-sql/common/dto/extended-likes-info.dto.sql';

export class ExtendedLikesInfoViewDto extends BaseLikesInfoViewDto {
  newestLikes: LikeDetailsViewDto[];

  static mapToView(
    extendedLikesInfo: ExtendedLikesInfoDtoSql,
    myStatus: LikeStatus,
  ): ExtendedLikesInfoViewDto {
    const dto = new ExtendedLikesInfoViewDto();

    dto.likesCount = extendedLikesInfo.likesCount;
    dto.dislikesCount = extendedLikesInfo.dislikesCount;
    dto.myStatus = myStatus;
    dto.newestLikes = extendedLikesInfo.newestLikes.map(
      LikeDetailsViewDto.mapToView,
    );

    return dto;
  }

  static mapToViewMongo(
    extendedLikesInfo: ExtendedLikesInfo,
    myStatus: LikeStatus,
  ): ExtendedLikesInfoViewDto {
    const dto = new ExtendedLikesInfoViewDto();

    dto.likesCount = extendedLikesInfo.likesCount;
    dto.dislikesCount = extendedLikesInfo.dislikesCount;
    dto.myStatus = myStatus;
    dto.newestLikes = extendedLikesInfo.newestLikes.map(
      LikeDetailsViewDto.mapToViewMongo,
    );

    return dto;
  }
}
