import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { BlogViewDto } from '../../api/view-dto/blogs.view-dto';
import { BlogsQueryRepo } from '../../infrastructure/query/blogs.query-repo';

export class GetBlogByIdOrInternalFailQuery {
  constructor(public blogId: number) {}
}

@QueryHandler(GetBlogByIdOrInternalFailQuery)
export class GetBlogByIdOrInternalFailQueryHandler
  implements IQueryHandler<GetBlogByIdOrInternalFailQuery, BlogViewDto>
{
  constructor(private blogsQueryRepository: BlogsQueryRepo) {}

  async execute({
    blogId,
  }: GetBlogByIdOrInternalFailQuery): Promise<BlogViewDto> {
    return this.blogsQueryRepository.findByIdOrInternalFail(blogId);
  }
}
