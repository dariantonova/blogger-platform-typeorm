import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { BlogViewDtoSql } from '../../api/view-dto/blog.view-dto.sql';
import { BlogsQueryRepositorySql } from '../../infrastructure/query/blogs.query-repository.sql';

export class GetBlogByIdOrNotFoundFailQuerySql {
  constructor(public blogId: number) {}
}

@QueryHandler(GetBlogByIdOrNotFoundFailQuerySql)
export class GetBlogByIdOrNotFoundFailQueryHandlerSql
  implements IQueryHandler<GetBlogByIdOrNotFoundFailQuerySql, BlogViewDtoSql>
{
  constructor(private blogsQueryRepository: BlogsQueryRepositorySql) {}

  async execute({
    blogId,
  }: GetBlogByIdOrNotFoundFailQuerySql): Promise<BlogViewDtoSql> {
    return this.blogsQueryRepository.findByIdOrNotFoundFail(blogId);
  }
}
