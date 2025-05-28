import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { BlogViewDtoSql } from '../../api/view-dto/blog.view-dto.sql';
import { BlogsQueryRepositorySql } from '../../infrastructure/query/blogs.query-repository.sql';

export class GetBlogByIdOrInternalFailQuerySql {
  constructor(public blogId: number) {}
}

@QueryHandler(GetBlogByIdOrInternalFailQuerySql)
export class GetBlogByIdOrInternalFailQueryHandlerSql
  implements IQueryHandler<GetBlogByIdOrInternalFailQuerySql, BlogViewDtoSql>
{
  constructor(private blogsQueryRepository: BlogsQueryRepositorySql) {}

  async execute({
    blogId,
  }: GetBlogByIdOrInternalFailQuerySql): Promise<BlogViewDtoSql> {
    return this.blogsQueryRepository.findByIdOrInternalFail(blogId);
  }
}
