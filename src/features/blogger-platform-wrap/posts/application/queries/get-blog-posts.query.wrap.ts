import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { BlogsQueryRepositoryWrap } from '../../../blogs/infrastructure/query/blogs.query-repository.wrap';
import { PostsQueryRepositoryWrap } from '../../infrastructure/query/posts.query-repository.wrap';
import { GetPostsQueryParams } from '../../../../blogger-platform/posts/api/input-dto/get-posts-query-params.input-dto';
import { PostViewDto } from '../../../../blogger-platform/posts/api/view-dto/posts.view-dto';

export class GetBlogPostsQueryWrap {
  constructor(
    public blogId: number,
    public queryParams: GetPostsQueryParams,
    public currentUserId: number | undefined,
  ) {}
}

@QueryHandler(GetBlogPostsQueryWrap)
export class GetBlogPostsQueryHandlerWrap
  implements
    IQueryHandler<GetBlogPostsQueryWrap, PaginatedViewDto<PostViewDto[]>>
{
  constructor(
    private blogsQueryRepository: BlogsQueryRepositoryWrap,
    private postsQueryRepository: PostsQueryRepositoryWrap,
  ) {}

  async execute({
    blogId,
    queryParams,
    currentUserId,
  }: GetBlogPostsQueryWrap): Promise<PaginatedViewDto<PostViewDto[]>> {
    await this.blogsQueryRepository.findByIdOrNotFoundFail(blogId);

    return this.postsQueryRepository.findBlogPosts(
      blogId,
      queryParams,
      currentUserId,
    );
  }
}
