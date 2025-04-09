import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { BlogViewDto } from '../../api/view-dto/blogs.view-dto';
import { BlogsQueryRepository } from '../../infrastructure/query/blogs.query-repository';

export class GetBlogByIdOrNotFoundFailQuery {
  constructor(public blogId: string) {}
}

@QueryHandler(GetBlogByIdOrNotFoundFailQuery)
export class GetBlogByIdOrNotFoundFailQueryHandler
  implements IQueryHandler<GetBlogByIdOrNotFoundFailQuery, BlogViewDto>
{
  constructor(private blogsQueryRepository: BlogsQueryRepository) {}

  async execute({
    blogId,
  }: GetBlogByIdOrNotFoundFailQuery): Promise<BlogViewDto> {
    return this.blogsQueryRepository.findByIdOrNotFoundFail(blogId);
  }
}
