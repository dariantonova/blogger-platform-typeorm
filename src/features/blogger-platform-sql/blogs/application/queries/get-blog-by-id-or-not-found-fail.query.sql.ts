import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { BlogsQueryRepositorySql } from '../../infrastructure/query/blogs.query-repository.sql';
import { BlogViewDto } from '../../../../blogger-platform/blogs/api/view-dto/blogs.view-dto';

export class GetBlogByIdOrNotFoundFailQuerySql {
  constructor(public blogId: number) {}
}

@QueryHandler(GetBlogByIdOrNotFoundFailQuerySql)
export class GetBlogByIdOrNotFoundFailQueryHandlerSql
  implements IQueryHandler<GetBlogByIdOrNotFoundFailQuerySql, BlogViewDto>
{
  constructor(private blogsQueryRepository: BlogsQueryRepositorySql) {}

  async execute({
    blogId,
  }: GetBlogByIdOrNotFoundFailQuerySql): Promise<BlogViewDto> {
    return this.blogsQueryRepository.findByIdOrNotFoundFail(blogId);
  }
}
