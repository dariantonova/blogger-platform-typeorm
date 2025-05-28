import { LikeStatus } from '../../../../blogger-platform/likes/dto/like-status';
import { PostDtoSql } from '../../dto/post.dto.sql';
import { ExtendedLikesInfoViewDtoSql } from '../../../common/dto/extended-likes-info.view-dto.sql';

export class PostViewDtoSql {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: ExtendedLikesInfoViewDtoSql;

  static mapToView(post: PostDtoSql, myStatus: LikeStatus): PostViewDtoSql {
    const dto = new PostViewDtoSql();

    dto.id = post.id.toString();
    dto.title = post.title;
    dto.shortDescription = post.shortDescription;
    dto.content = post.content;
    dto.blogId = post.blogId.toString();
    dto.blogName = post.blogName;
    dto.createdAt = post.createdAt.toISOString();
    dto.extendedLikesInfo = ExtendedLikesInfoViewDtoSql.mapToView(
      post.extendedLikesInfo,
      myStatus,
    );

    return dto;
  }
}
