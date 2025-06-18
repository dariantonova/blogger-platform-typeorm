import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { BlogsQueryRepository } from '../../infrastructure/query/blogs.query-repository';
import { BlogViewDto } from '../../api/view-dto/blogs.view-dto';

export class GetBlogByIdOrInternalFailQuery {
  constructor(public blogId: number) {}
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
