import { Injectable } from '@nestjs/common';
import { LikeStatus } from '../../../blogger-platform/likes/dto/like-status';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { PostDtoSql } from '../dto/post.dto.sql';
import { PostViewDto } from '../../../blogger-platform/posts/api/view-dto/posts.view-dto';

@Injectable()
export class PostsQueryServiceSql {
  // constructor(private likesQueryRepository: LikesQueryRepository) {}

  async mapPostToView(
    post: PostDtoSql,
    currentUserId: number | undefined,
  ): Promise<PostViewDto> {
    // const myStatus = currentUserId
    //   ? await this.likesQueryRepository.findLikeStatus(
    //     currentUserId,
    //     post._id.toString(),
    //   )
    //   : LikeStatus.None;
    // todo: find my status when likes feature is added
    const myStatus = LikeStatus.None;

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
