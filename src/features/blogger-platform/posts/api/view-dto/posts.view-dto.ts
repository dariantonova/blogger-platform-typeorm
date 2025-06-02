import { ExtendedLikesInfoViewDto } from '../../../common/dto/extended-likes-info.view-dto';
import { PostDocument } from '../../domain/post.entity';
import { LikeStatus } from '../../../likes/dto/like-status';
import { PostDtoSql } from '../../../../blogger-platform-sql/posts/dto/post.dto.sql';
import { ExtendedLikesInfoViewDtoSql } from '../../../../blogger-platform-sql/common/dto/extended-likes-info.view-dto.sql';

export class PostViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: ExtendedLikesInfoViewDto;

  static mapToView(post: PostDtoSql, myStatus: LikeStatus): PostViewDto {
    const dto = new PostViewDto();

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

  static mapToViewMongo(post: PostDocument, myStatus: LikeStatus): PostViewDto {
    const dto = new PostViewDto();

    dto.id = post._id.toString();
    dto.title = post.title;
    dto.shortDescription = post.shortDescription;
    dto.content = post.content;
    dto.blogId = post.blogId;
    dto.blogName = post.blogName;
    dto.createdAt = post.createdAt.toISOString();
    dto.extendedLikesInfo = ExtendedLikesInfoViewDto.mapToViewMongo(
      post.extendedLikesInfo,
      myStatus,
    );

    return dto;
  }
}
