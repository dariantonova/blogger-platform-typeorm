import { LikeStatus } from '../../../../../blogger-platform/likes/dto/like-status';

export class CommentViewRowWrap {
  id: number;
  content: string;
  user_id: number;
  user_login: string;
  created_at: Date;
  likes_count: number;
  dislikes_count: number;
  my_status: LikeStatus;
}
