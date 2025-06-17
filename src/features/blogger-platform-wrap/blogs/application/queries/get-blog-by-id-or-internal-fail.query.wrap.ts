import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { BlogsQueryRepositoryWrap } from '../../infrastructure/query/blogs.query-repository.wrap';
import { BlogViewDto } from '../../../../blogger-platform/blogs/api/view-dto/blogs.view-dto';

export class GetBlogByIdOrInternalFailQueryWrap {
  constructor(public blogId: number) {}
}

@QueryHandler(GetBlogByIdOrInternalFailQueryWrap)
export class GetBlogByIdOrInternalFailQueryHandlerWrap
  implements IQueryHandler<GetBlogByIdOrInternalFailQueryWrap, BlogViewDto>
{
  constructor(private blogsQueryRepository: BlogsQueryRepositoryWrap) {}

  async execute({
    blogId,
  }: GetBlogByIdOrInternalFailQueryWrap): Promise<BlogViewDto> {
    return this.blogsQueryRepository.findByIdOrInternalFail(blogId);
  }
}
