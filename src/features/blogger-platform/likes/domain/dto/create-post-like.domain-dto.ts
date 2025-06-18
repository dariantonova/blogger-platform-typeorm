import { LikeStatus } from '../../dto/like-status';

export class CreatePostLikeDomainDto {
  postId: number;
  userId: number;
  status: LikeStatus;
}
