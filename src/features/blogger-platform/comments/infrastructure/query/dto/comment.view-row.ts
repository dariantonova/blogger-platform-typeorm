import { LikeStatus } from '../../../../likes/dto/like-status';

export class CommentViewRow {
  id: number;
  content: string;
  user_id: number;
  user_login: string;
  created_at: Date;
  likes_count: number;
  dislikes_count: number;
  my_status: LikeStatus;
}
