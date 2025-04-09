import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { BlogViewDto } from '../../api/view-dto/blogs.view-dto';
import { BlogsQueryRepository } from '../../infrastructure/query/blogs.query-repository';

export class GetBlogByIdOrInternalFailQuery {
  constructor(public blogId: string) {}
}

@QueryHandler(GetBlogByIdOrInternalFailQuery)
export class GetBlogByIdOrInternalFailQueryHandler
  implements IQueryHandler<GetBlogByIdOrInternalFailQuery, BlogViewDto>
{
  constructor(private blogsQueryRepository: BlogsQueryRepository) {}

  async execute({
    blogId,
  }: GetBlogByIdOrInternalFailQuery): Promise<BlogViewDto> {
    return this.blogsQueryRepository.findByIdOrInternalFail(blogId);
  }
}
