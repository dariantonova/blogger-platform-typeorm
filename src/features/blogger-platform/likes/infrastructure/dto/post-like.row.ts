import { LikeStatus } from '../../dto/like-status';

export class PostLikeRow {
  id: number;
  post_id: number;
  user_id: number;
  status: LikeStatus;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}
