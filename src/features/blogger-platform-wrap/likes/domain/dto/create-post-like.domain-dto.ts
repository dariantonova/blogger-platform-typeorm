import { LikeStatus } from '../../../../blogger-platform/likes/dto/like-status';

export class CreatePostLikeDomainDto {
  postId: number;
  userId: number;
  status: LikeStatus;
}
