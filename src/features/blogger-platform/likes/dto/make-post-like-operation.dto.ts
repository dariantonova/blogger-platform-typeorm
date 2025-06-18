import { LikeStatus } from './like-status';

export class MakePostLikeOperationDto {
  postId: number;
  userId: number;
  likeStatus: LikeStatus;
}
