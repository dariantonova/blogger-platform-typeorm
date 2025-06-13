import { LikeStatus } from '../../../../blogger-platform/likes/dto/like-status';

export class CreateCommentLikeDomainDto {
  commentId: string;
  userId: string;
  status: LikeStatus;
}
