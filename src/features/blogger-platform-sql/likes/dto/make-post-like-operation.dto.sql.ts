import { LikeStatus } from '../../../blogger-platform/likes/dto/like-status';

export class MakePostLikeOperationDtoSql {
  postId: number;
  userId: number;
  likeStatus: LikeStatus;
}
