import { LikeStatus } from '../../likes/dto/like-status';

export class MakePostLikeOperationDto {
  postId: string;
  userId: string;
  likeStatus: LikeStatus;
}
