import { GetPostsQueryParams } from '../../../../blogger-platform/posts/api/input-dto/get-posts-query-params.input-dto';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { PostViewDtoSql } from '../../api/view-dto/post.view-dto.sql';
import { PostsQueryRepositorySql } from '../../infrastructure/query/posts.query-repository.sql';
import { PostsQueryServiceSql } from '../posts.query-service.sql';

export class GetPostsQuerySql {
  constructor(
    public queryParams: GetPostsQueryParams,
    public currentUserId: number | undefined,
  ) {}
}

@QueryHandler(GetPostsQuerySql)
export class GetPostsQueryHandlerSql
  implements IQueryHandler<GetPostsQuerySql, PaginatedViewDto<PostViewDtoSql[]>>
{
  constructor(
    private postsQueryRepository: PostsQueryRepositorySql,
    private postsQueryService: PostsQueryServiceSql,
  ) {}

  async execute({
    queryParams,
    currentUserId,
  }: GetPostsQuerySql): Promise<PaginatedViewDto<PostViewDtoSql[]>> {
    const paginatedPosts =
      await this.postsQueryRepository.findPosts(queryParams);

    return this.postsQueryService.mapPaginatedPostsToView(
      paginatedPosts,
      currentUserId,
    );
  }
}
