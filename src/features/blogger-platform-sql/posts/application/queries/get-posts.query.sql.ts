import { GetPostsQueryParams } from '../../../../blogger-platform/posts/api/input-dto/get-posts-query-params.input-dto';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { PostsQueryRepositorySql } from '../../infrastructure/query/posts.query-repository.sql';
import { PostsQueryServiceSql } from '../posts.query-service.sql';
import { PostViewDto } from '../../../../blogger-platform/posts/api/view-dto/posts.view-dto';

export class GetPostsQuerySql {
  constructor(
    public queryParams: GetPostsQueryParams,
    public currentUserId: number | undefined,
  ) {}
}

@QueryHandler(GetPostsQuerySql)
export class GetPostsQueryHandlerSql
  implements IQueryHandler<GetPostsQuerySql, PaginatedViewDto<PostViewDto[]>>
{
  constructor(
    private postsQueryRepository: PostsQueryRepositorySql,
    private postsQueryService: PostsQueryServiceSql,
  ) {}

  async execute({
    queryParams,
    currentUserId,
  }: GetPostsQuerySql): Promise<PaginatedViewDto<PostViewDto[]>> {
    const paginatedPosts =
      await this.postsQueryRepository.findPosts(queryParams);

    return this.postsQueryService.mapPaginatedPostsToView(
      paginatedPosts,
      currentUserId,
    );
  }
}
