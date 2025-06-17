import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { BlogsQueryRepositoryWrap } from '../../infrastructure/query/blogs.query-repository.wrap';
import { BlogViewDto } from '../../../../blogger-platform/blogs/api/view-dto/blogs.view-dto';

export class GetBlogByIdOrNotFoundFailQueryWrap {
  constructor(public blogId: number) {}
}

@QueryHandler(GetBlogByIdOrNotFoundFailQueryWrap)
export class GetBlogByIdOrNotFoundFailQueryHandlerWrap
  implements IQueryHandler<GetBlogByIdOrNotFoundFailQueryWrap, BlogViewDto>
{
  constructor(private blogsQueryRepository: BlogsQueryRepositoryWrap) {}

  async execute({
    blogId,
  }: GetBlogByIdOrNotFoundFailQueryWrap): Promise<BlogViewDto> {
    return this.blogsQueryRepository.findByIdOrNotFoundFail(blogId);
  }
}
