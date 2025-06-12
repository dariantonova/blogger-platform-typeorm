import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { PostsQueryRepositoryWrap } from '../../infrastructure/query/posts.query-repository.wrap';
import { GetPostsQueryParams } from '../../../../blogger-platform/posts/api/input-dto/get-posts-query-params.input-dto';
import { PostViewDto } from '../../../../blogger-platform/posts/api/view-dto/posts.view-dto';

export class GetPostsQueryWrap {
  constructor(
    public queryParams: GetPostsQueryParams,
    public currentUserId: string | undefined,
  ) {}
}

@QueryHandler(GetPostsQueryWrap)
export class GetPostsQueryHandlerWrap
  implements IQueryHandler<GetPostsQueryWrap, PaginatedViewDto<PostViewDto[]>>
{
  constructor(private postsQueryRepository: PostsQueryRepositoryWrap) {}

  async execute({
    queryParams,
    currentUserId,
  }: GetPostsQueryWrap): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.postsQueryRepository.findPosts(queryParams, currentUserId);
  }
}
