import { GetPostsQueryParams } from '../../../posts/api/input-dto/get-posts-query-params.input-dto';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { PostViewDto } from '../../../posts/api/view-dto/posts.view-dto';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { PostsQueryRepository } from '../../../posts/infrastructure/query/posts.query-repository';

export class GetBlogPostsQuery {
  constructor(
    public blogId: string,
    public queryParams: GetPostsQueryParams,
  ) {}
}

@QueryHandler(GetBlogPostsQuery)
export class GetBlogPostsQueryHandler
  implements IQueryHandler<GetBlogPostsQuery, PaginatedViewDto<PostViewDto[]>>
{
  constructor(
    private blogsRepository: BlogsRepository,
    private postsQueryRepository: PostsQueryRepository,
  ) {}

  async execute({
    blogId,
    queryParams,
  }: GetBlogPostsQuery): Promise<PaginatedViewDto<PostViewDto[]>> {
    await this.blogsRepository.findByIdOrNotFoundFail(blogId);

    return this.postsQueryRepository.findBlogPosts(blogId, queryParams);
  }
}
