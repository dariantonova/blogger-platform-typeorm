import { ExtendedLikesInfoViewDto } from '../../../common/dto/extended-likes-info.view-dto';
import { PostViewRow } from '../../infrastructure/query/dto/post.view-row';
import { LikeDetailsViewDto } from '../../../common/dto/like-details.view-dto';

export class PostViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: ExtendedLikesInfoViewDto;

  static mapToView(row: PostViewRow): PostViewDto {
    const dto = new PostViewDto();

    dto.id = row.id.toString();
    dto.title = row.title;
    dto.shortDescription = row.short_description;
    dto.content = row.content;
    dto.blogId = row.blog_id.toString();
    dto.blogName = row.blog_name;
    dto.createdAt = row.created_at.toISOString();
    dto.extendedLikesInfo = {
      likesCount: row.likes_count,
      dislikesCount: row.dislikes_count,
      myStatus: row.my_status,
      newestLikes: row.newest_likes.map(LikeDetailsViewDto.mapToView),
    };

    return dto;
  }
}
