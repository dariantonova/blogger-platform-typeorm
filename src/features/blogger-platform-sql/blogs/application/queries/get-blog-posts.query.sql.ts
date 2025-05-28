import { GetPostsQueryParams } from '../../../../blogger-platform/posts/api/input-dto/get-posts-query-params.input-dto';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { PostViewDtoSql } from '../../../posts/api/view-dto/post.view-dto.sql';
import { BlogsQueryRepositorySql } from '../../infrastructure/query/blogs.query-repository.sql';
import { PostsQueryRepositorySql } from '../../../posts/infrastructure/query/posts.query-repository.sql';
import { PostsQueryServiceSql } from '../../../posts/application/posts.query-service.sql';

export class GetBlogPostsQuerySql {
  constructor(
    public blogId: number,
    public queryParams: GetPostsQueryParams,
    public currentUserId: number | undefined,
  ) {}
}

@QueryHandler(GetBlogPostsQuerySql)
export class GetBlogPostsQueryHandlerSql
  implements
    IQueryHandler<GetBlogPostsQuerySql, PaginatedViewDto<PostViewDtoSql[]>>
{
  constructor(
    private blogsQueryRepository: BlogsQueryRepositorySql,
    private postsQueryRepository: PostsQueryRepositorySql,
    private postsQueryService: PostsQueryServiceSql,
  ) {}

  async execute({
    blogId,
    queryParams,
    currentUserId,
  }: GetBlogPostsQuerySql): Promise<PaginatedViewDto<PostViewDtoSql[]>> {
    await this.blogsQueryRepository.findByIdOrNotFoundFail(blogId);

    const paginatedPosts = await this.postsQueryRepository.findBlogPosts(
      blogId,
      queryParams,
    );

    return this.postsQueryService.mapPaginatedPostsToView(
      paginatedPosts,
      currentUserId,
    );
  }
}
