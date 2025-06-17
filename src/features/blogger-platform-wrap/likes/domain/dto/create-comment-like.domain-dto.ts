import { LikeStatus } from '../../../../blogger-platform/likes/dto/like-status';

export class CreateCommentLikeDomainDto {
  commentId: number;
  userId: number;
  status: LikeStatus;
}
