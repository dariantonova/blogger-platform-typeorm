import { LikeStatus } from '../../likes/dto/like-status';

export class MakeCommentLikeOperationDto {
  commentId: string;
  userId: string;
  likeStatus: LikeStatus;
}
