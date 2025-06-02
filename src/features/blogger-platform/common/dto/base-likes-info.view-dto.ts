import { LikeStatus } from '../../likes/dto/like-status';
import { BaseLikesInfo } from '../schemas/base-likes-info.schema';
import { BaseLikesInfoDtoSql } from '../../../blogger-platform-sql/common/dto/base-likes-info.dto.sql';

export class BaseLikesInfoViewDto {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;

  static mapToView(
    likeInfo: BaseLikesInfoDtoSql,
    myStatus: LikeStatus,
  ): BaseLikesInfoViewDto {
    const dto = new BaseLikesInfoViewDto();

    dto.likesCount = likeInfo.likesCount;
    dto.dislikesCount = likeInfo.dislikesCount;
    dto.myStatus = myStatus;

    return dto;
  }

  static mapToViewMongo(
    likeInfo: BaseLikesInfo,
    myStatus: LikeStatus,
  ): BaseLikesInfoViewDto {
    const dto = new BaseLikesInfoViewDto();

    dto.likesCount = likeInfo.likesCount;
    dto.dislikesCount = likeInfo.dislikesCount;
    dto.myStatus = myStatus;

    return dto;
  }
}
