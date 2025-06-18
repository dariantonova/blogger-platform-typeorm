import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { BlogsQueryRepository } from '../../infrastructure/query/blogs.query-repository';
import { BlogViewDto } from '../../api/view-dto/blogs.view-dto';

export class GetBlogByIdOrNotFoundFailQuery {
  constructor(public blogId: number) {}
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
