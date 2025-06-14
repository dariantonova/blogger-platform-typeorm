import { LikeStatus } from '../../../../../blogger-platform/likes/dto/like-status';
import { LikeDetailsViewRowWrap } from '../../../../common/infrastructure/query/dto/like-details.view-row.wrap';

export class PostViewRowWrap {
  id: number;
  title: string;
  short_description: string;
  content: string;
  blog_id: number;
  blog_name: string;
  created_at: Date;
  likes_count: number;
  dislikes_count: number;
  my_status: LikeStatus;
  newest_likes: LikeDetailsViewRowWrap[];
}
