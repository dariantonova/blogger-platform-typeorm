import { LikeStatus } from '../../likes/dto/like-status';
import { BaseLikesInfo } from '../schemas/base-likes-info.schema';

export class BaseLikesInfoViewDto {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;

  static mapToView(
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
