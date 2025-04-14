import { Injectable } from '@nestjs/common';
import { PostDocument } from '../domain/post.entity';
import { PostViewDto } from '../api/view-dto/posts.view-dto';
import { LikesQueryRepository } from '../../likes/infrastructure/query/likes.query-repository';
import { LikeStatus } from '../../likes/dto/like-status';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';

@Injectable()
export class PostsQueryService {
  constructor(private likesQueryRepository: LikesQueryRepository) {}

  async mapPostToView(
    post: PostDocument,
    currentUserId: string | undefined,
  ): Promise<PostViewDto> {
    const myStatus = currentUserId
      ? await this.likesQueryRepository.findLikeStatus(
          currentUserId,
          post._id.toString(),
        )
      : LikeStatus.None;

    return PostViewDto.mapToView(post, myStatus);
  }

  async mapPaginatedPostsToView(
    paginatedPosts: PaginatedViewDto<PostDocument[]>,
    currentUserId: string | undefined,
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
