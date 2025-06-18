import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { BlogsQueryRepository } from '../../../blogs/infrastructure/query/blogs.query-repository';
import { PostsQueryRepository } from '../../infrastructure/query/posts.query-repository';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { PostViewDto } from '../../api/view-dto/posts.view-dto';

export class GetBlogPostsQuery {
  constructor(
    public blogId: number,
    public queryParams: GetPostsQueryParams,
    public currentUserId: number | undefined,
  ) {}
}

@QueryHandler(GetBlogPostsQuery)
export class GetBlogPostsQueryHandler
  implements IQueryHandler<GetBlogPostsQuery, PaginatedViewDto<PostViewDto[]>>
{
  constructor(
    private blogsQueryRepository: BlogsQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
  ) {}

  async execute({
    blogId,
    queryParams,
    currentUserId,
  }: GetBlogPostsQuery): Promise<PaginatedViewDto<PostViewDto[]>> {
    await this.blogsQueryRepository.findByIdOrNotFoundFail(blogId);

    return this.postsQueryRepository.findBlogPosts(
      blogId,
      queryParams,
      currentUserId,
    );
  }
}
