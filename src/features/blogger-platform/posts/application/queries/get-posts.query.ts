import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { PostViewDto } from '../../api/view-dto/posts.view-dto';
import { PostsQueryRepository } from '../../infrastructure/query/posts.query-repository';
import { PostsQueryService } from '../posts.query-service';

export class GetPostsQuery {
  constructor(
    public queryParams: GetPostsQueryParams,
    public currentUserId: string | undefined,
  ) {}
}

@QueryHandler(GetPostsQuery)
export class GetPostsQueryHandler
  implements IQueryHandler<GetPostsQuery, PaginatedViewDto<PostViewDto[]>>
{
  constructor(
    private postsQueryRepository: PostsQueryRepository,
    private postsQueryService: PostsQueryService,
  ) {}

  async execute({
    queryParams,
    currentUserId,
  }: GetPostsQuery): Promise<PaginatedViewDto<PostViewDto[]>> {
    const paginatedPosts =
      await this.postsQueryRepository.findPosts(queryParams);

    return this.postsQueryService.mapPaginatedPostsToView(
      paginatedPosts,
      currentUserId,
    );
  }
}
