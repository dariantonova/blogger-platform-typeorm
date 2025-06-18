import { LikeStatus } from '../../likes/dto/like-status';

export class BaseLikesInfoViewDto {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
}
