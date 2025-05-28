import { LikeStatus } from '../../../blogger-platform/likes/dto/like-status';
import { BaseLikesInfoDtoSql } from './base-likes-info.dto.sql';

export class BaseLikesInfoViewDtoSql {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;

  static mapToView(
    likesInfo: BaseLikesInfoDtoSql,
    myStatus: LikeStatus,
  ): BaseLikesInfoViewDtoSql {
    const dto = new BaseLikesInfoViewDtoSql();

    dto.likesCount = likesInfo.likesCount;
    dto.dislikesCount = likesInfo.dislikesCount;
    dto.myStatus = myStatus;

    return dto;
  }
}
