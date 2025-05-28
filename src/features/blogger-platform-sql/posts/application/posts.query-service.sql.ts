import { Injectable } from '@nestjs/common';
import { LikeStatus } from '../../../blogger-platform/likes/dto/like-status';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { PostDtoSql } from '../dto/post.dto.sql';
import { PostViewDtoSql } from '../api/view-dto/post.view-dto.sql';

@Injectable()
export class PostsQueryServiceSql {
  // constructor(private likesQueryRepository: LikesQueryRepository) {}

  async mapPostToView(
    post: PostDtoSql,
    currentUserId: number | undefined,
  ): Promise<PostViewDtoSql> {
    // const myStatus = currentUserId
    //   ? await this.likesQueryRepository.findLikeStatus(
    //     currentUserId,
    //     post._id.toString(),
    //   )
    //   : LikeStatus.None;
    // todo: find my status when likes feature is added
    const myStatus = LikeStatus.None;

    return PostViewDtoSql.mapToView(post, myStatus);
  }

  async mapPaginatedPostsToView(
    paginatedPosts: PaginatedViewDto<PostDtoSql[]>,
    currentUserId: number | undefined,
  ): Promise<PaginatedViewDto<PostViewDtoSql[]>> {
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
