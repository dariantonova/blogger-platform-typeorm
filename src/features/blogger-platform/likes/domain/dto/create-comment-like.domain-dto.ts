import { LikeStatus } from '../../dto/like-status';

export class CreateCommentLikeDomainDto {
  commentId: number;
  userId: number;
  status: LikeStatus;
}
