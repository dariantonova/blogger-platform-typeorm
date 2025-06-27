import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { BlogViewDto } from '../../api/view-dto/blogs.view-dto';
import { BlogsQueryRepo } from '../../infrastructure/query/blogs.query-repo';

export class GetBlogByIdOrNotFoundFailQuery {
  constructor(public blogId: number) {}
}

@QueryHandler(GetBlogByIdOrNotFoundFailQuery)
export class GetBlogByIdOrNotFoundFailQueryHandler
  implements IQueryHandler<GetBlogByIdOrNotFoundFailQuery, BlogViewDto>
{
  constructor(private blogsQueryRepository: BlogsQueryRepo) {}

  async execute({
    blogId,
  }: GetBlogByIdOrNotFoundFailQuery): Promise<BlogViewDto> {
    return this.blogsQueryRepository.findByIdOrNotFoundFail(blogId);
  }
}
