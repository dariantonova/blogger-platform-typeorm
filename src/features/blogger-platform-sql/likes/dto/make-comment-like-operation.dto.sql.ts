import { LikeStatus } from '../../../blogger-platform/likes/dto/like-status';

export class MakeCommentLikeOperationDtoSql {
  commentId: number;
  userId: number;
  likeStatus: LikeStatus;
}
