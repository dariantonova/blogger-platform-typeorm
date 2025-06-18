import { LikeStatus } from './like-status';

export class MakeCommentLikeOperationDto {
  commentId: number;
  userId: number;
  likeStatus: LikeStatus;
}
