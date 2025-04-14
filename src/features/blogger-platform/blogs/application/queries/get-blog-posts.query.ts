import { GetPostsQueryParams } from '../../../posts/api/input-dto/get-posts-query-params.input-dto';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { PostViewDto } from '../../../posts/api/view-dto/posts.view-dto';
import { PostsQueryRepository } from '../../../posts/infrastructure/query/posts.query-repository';
import { PostsQueryService } from '../../../posts/application/posts.query-service';
import { BlogsQueryRepository } from '../../infrastructure/query/blogs.query-repository';

export class GetBlogPostsQuery {
  constructor(
    public blogId: string,
    public queryParams: GetPostsQueryParams,
    public currentUserId: string | undefined,
  ) {}
}

@QueryHandler(GetBlogPostsQuery)
export class GetBlogPostsQueryHandler
  implements IQueryHandler<GetBlogPostsQuery, PaginatedViewDto<PostViewDto[]>>
{
  constructor(
    private blogsQueryRepository: BlogsQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
    private postsQueryService: PostsQueryService,
  ) {}

  async execute({
    blogId,
    queryParams,
    currentUserId,
  }: GetBlogPostsQuery): Promise<PaginatedViewDto<PostViewDto[]>> {
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
