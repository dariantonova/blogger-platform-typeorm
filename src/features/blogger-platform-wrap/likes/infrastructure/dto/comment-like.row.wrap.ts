import { LikeStatus } from '../../../../blogger-platform/likes/dto/like-status';

export class CommentLikeRowWrap {
  id: number;
  comment_id: number;
  user_id: number;
  status: LikeStatus;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}
