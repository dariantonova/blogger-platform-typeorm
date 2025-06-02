import { Injectable } from '@nestjs/common';
import { LikeStatus } from '../../../blogger-platform/likes/dto/like-status';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { PostDtoSql } from '../dto/post.dto.sql';
import { PostViewDto } from '../../../blogger-platform/posts/api/view-dto/posts.view-dto';
import { PostLikesQueryRepositorySql } from '../../likes/infrastructure/query/post-likes.query-repository.sql';

@Injectable()
export class PostsQueryServiceSql {
  constructor(private postLikesQueryRepository: PostLikesQueryRepositorySql) {}

  async mapPostToView(
    post: PostDtoSql,
    currentUserId: number | undefined,
  ): Promise<PostViewDto> {
    const myStatus = currentUserId
      ? await this.postLikesQueryRepository.findPostLikeStatus(
          post.id,
          currentUserId,
        )
      : LikeStatus.None;

    return PostViewDto.mapToView(post, myStatus);
  }

  async mapPaginatedPostsToView(
    paginatedPosts: PaginatedViewDto<PostDtoSql[]>,
    currentUserId: number | undefined,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const postsViewDtos = await Promise.all(
      paginatedPosts.items.map((post) =>
        this.mapPostToView(post, currentUserId),
      ),
    );

    return {
      ...paginatedPosts,
      items: postsViewDtos,
    };
  }
}
